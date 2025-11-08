import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowRight,
    Zap,
    Shield,
    TrendingUp,
    Clock,
    Users,
    DollarSign,
    Hash,
    CheckCircle,
    ExternalLink,
    Filter,
    Search,
    Copy,
    User,
    QrCode,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { graphQLClient } from "../services/graphql/client";
import { gql } from "graphql-request";


interface Tip {
    id: string;
    from: {
        id: string;
        address: string;
        basename: string;
        displayName: string;
        avatarUrl: string;
    };
    to: {
        id: string;
        address: string;
        basename: string;
        displayName: string;
        avatarUrl: string;
    };
    token: {
        id: string;
        address: string;
    };
    amount: string;
    message: string;
    timestamp: string;
    blockNumber: string;
    transactionHash: string;
}

interface Creator {
    id: string;
    address: string;
    basename: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    totalAmountReceived: string;
    totalTipsReceived: string;
    tipCount: number;
    tippedByCount: number;
    isActive: boolean;
}

// GraphQL queries corrigidas
const GET_ALL_TIPS = gql`
  query GetAllTips(
    $limit: Int
    $offset: Int
    $orderBy: [Tip_order_by!]
    $where: Tip_bool_exp = {}
  ) {
    Tip(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
      id
      from {
        id
        address
        basename
        displayName
        avatarUrl
      }
      to {
        id
        address
        basename
        displayName
        avatarUrl
      }
      token {
        id
        address
      }
      amount
      message
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

const GET_TIPS_COUNT = gql`
  query GetTipsCount($where: Tip_bool_exp = {}) {
    Tip(where: $where) {
      id
    }
  }
`;

const GET_TIP_BY_HASH = gql`
  query GetTipByHash($transactionHash: String!) {
    Tip(where: { transactionHash: { _eq: $transactionHash } }) {
      id
      from {
        id
        address
        basename
        displayName
        avatarUrl
      }
      to {
        id
        address
        basename
        displayName
        avatarUrl
      }
      token {
        id
        address
      }
      amount
      message
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

const GET_TIPS_BY_ADDRESS = gql`
  query GetTipsByAddress($address: String!) {
    Tip(
      where: {
        _or: [
          { from: { address: { _eq: $address } } }
          { to: { address: { _eq: $address } } }
        ]
      }
      order_by: { timestamp: desc }
      limit: 100
    ) {
      id
      from {
        id
        address
        basename
        displayName
        avatarUrl
      }
      to {
        id
        address
        basename
        displayName
        avatarUrl
      }
      token {
        id
        address
      }
      amount
      message
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

const GET_CREATOR_BY_BASENAME = gql`
  query GetCreatorByBasename($basename: String!) {
    Creator(where: { basename: { _eq: $basename }, isActive: { _eq: true } }) {
      id
      address
      basename
      displayName
      avatarUrl
      bio
      totalAmountReceived
      totalTipsReceived
      tipCount
      tippedByCount
      isActive
    }
  }
`;

const GET_TIPS_BY_BASENAME = gql`
  query GetTipsByBasename($basename: String!) {
    Tip(
      where: {
        _or: [
          { from: { basename: { _eq: $basename } } }
          { to: { basename: { _eq: $basename } } }
        ]
      }
      order_by: { timestamp: desc }
      limit: 100
    ) {
      id
      from {
        id
        address
        basename
        displayName
        avatarUrl
      }
      to {
        id
        address
        basename
        displayName
        avatarUrl
      }
      token {
        id
        address
      }
      amount
      message
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

// Stats queries corrigidas - usando queries manuais
const GET_ALL_TIPS_FOR_STATS = gql`
  query GetAllTipsForStats {
    Tip(limit: 10000) {
      id
      amount
      timestamp
    }
  }
`;

const GET_ALL_CREATORS_FOR_STATS = gql`
  query GetAllCreatorsForStats {
    Creator(where: { isActive: { _eq: true } }) {
      id
    }
  }
`;

const GET_RECENT_TIPS_FOR_STATS = gql`
  query GetRecentTipsForStats {
    Tip(
      where: { timestamp: { _gte: "now() - interval '24 hour'" } }
      limit: 10000
    ) {
      id
      amount
    }
  }
`;

const SEARCH_TIPS = gql`
  query SearchTips($searchTerm: String!) {
    Tip(
      where: {
        _or: [
          { from: { address: { _ilike: $searchTerm } } }
          { to: { address: { _ilike: $searchTerm } } }
          { from: { basename: { _ilike: $searchTerm } } }
          { to: { basename: { _ilike: $searchTerm } } }
          { from: { displayName: { _ilike: $searchTerm } } }
          { to: { displayName: { _ilike: $searchTerm } } }
          { transactionHash: { _ilike: $searchTerm } }
          { message: { _ilike: $searchTerm } }
        ]
      }
      order_by: { timestamp: desc }
      limit: 100
    ) {
      id
      from {
        id
        address
        basename
        displayName
        avatarUrl
      }
      to {
        id
        address
        basename
        displayName
        avatarUrl
      }
      token {
        id
        address
      }
      amount
      message
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

export function TipScan() {
    const { hash, address, basename } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tips, setTips] = useState<Tip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [creator, setCreator] = useState<Creator | null>(null);
    const [stats, setStats] = useState({
        totalTips: 0,
        totalVolume: "0",
        avgTipAmount: "0",
        tips24h: 0,
        volume24h: "0",
        filteredTips: 0,
        filteredVolume: "0",
        totalCreators: 0,
    });

    // Determinar o modo de visualização baseado nos parâmetros da rota
    const viewMode = hash ? 'hash' : address ? 'address' : basename ? 'basename' : 'all';

    // Load tips based on view mode
    const loadTips = async () => {
        setIsLoading(true);
        try {
            let data: any;
            let tipsData: Tip[] = [];
            let aggregateData: any = {};

            switch (viewMode) {
                case 'hash':
                    data = await graphQLClient.request(GET_TIP_BY_HASH, {
                        transactionHash: hash,
                    });
                    tipsData = data.Tip || [];
                    break;

                case 'address':
                    data = await graphQLClient.request(GET_TIPS_BY_ADDRESS, {
                        address: address?.toLowerCase(),
                    });
                    tipsData = data.Tip || [];
                    aggregateData = data.Tip_aggregate?.aggregate;
                    break;

                case 'basename':
                    // Primeiro carrega informações do creator
                    try {
                        const creatorData = await graphQLClient.request(GET_CREATOR_BY_BASENAME, {
                            basename: basename?.toLowerCase(),
                        });
                        setCreator(creatorData.Creator[0] || null);
                    } catch (error) {
                        console.error("Error loading creator:", error);
                    }

                    // Carrega as tips
                    data = await graphQLClient.request(GET_TIPS_BY_BASENAME, {
                        basename: basename?.toLowerCase(),
                    });
                    tipsData = data.Tip || [];
                    aggregateData = data.Tip_aggregate?.aggregate;
                    break;

                default:                   
                    if (searchQuery) {
                        data = await graphQLClient.request(SEARCH_TIPS, {
                            searchTerm: `%${searchQuery}%`,
                        });
                        tipsData = data.Tip || [];
                    } else {
                        const where: any = {};

                       
                        if (filterStatus !== "all") {
                            console.warn("Filter by status not available in current schema");
                        }

                        data = await graphQLClient.request(GET_ALL_TIPS, {
                            limit: 100,
                            offset: 0,
                            orderBy: { timestamp: "desc" },
                            where,
                        });
                        tipsData = data.Tip || [];
                        aggregateData = data.Tip_aggregate?.aggregate;
                    }
                    break;
            }

            setTips(tipsData);

            const calculateFilteredVolume = (tips: Tip[]) => {
                return tips.reduce((sum, tip) => sum + Number(tip.amount), 0);
            };

            if (viewMode !== 'all' && viewMode !== 'hash') {
                const filteredVolume = calculateFilteredVolume(tipsData);
                setStats(prev => ({
                    ...prev,
                    filteredTips: tipsData.length,
                    filteredVolume: (filteredVolume / 1e18).toFixed(2),
                }));
            }

        } catch (error) {
            console.error("Error loading tips:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load global stats - corrigido
    const loadStats = async () => {
        try {

            const [allTipsData, recentTipsData, creatorsData] = await Promise.all([
                graphQLClient.request(GET_ALL_TIPS_FOR_STATS),
                graphQLClient.request(GET_RECENT_TIPS_FOR_STATS),
                graphQLClient.request(GET_ALL_CREATORS_FOR_STATS)
            ]);

            const allTips = allTipsData.Tip || [];
            const recentTips = recentTipsData.Tip || [];
            const creators = creatorsData.Creator || [];

            // Calcula estatísticas manualmente
            const totalTips = allTips.length;
            const totalVolume = allTips.reduce((sum: number, tip: any) =>
                sum + Number(tip.amount), 0
            );
            const avgTipAmount = totalTips > 0 ? totalVolume / totalTips : 0;
            const tips24h = recentTips.length;
            const volume24h = recentTips.reduce((sum: number, tip: any) =>
                sum + Number(tip.amount), 0
            );

            setStats(prev => ({
                ...prev,
                totalTips,
                totalVolume: (totalVolume / 1e18).toFixed(2),
                avgTipAmount: (avgTipAmount / 1e18).toFixed(4),
                tips24h,
                volume24h: (volume24h / 1e18).toFixed(2),
                totalCreators: creators.length,
            }));
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    useEffect(() => {
        loadTips();
        if (viewMode === 'all') {
            loadStats();
        }
    }, [viewMode, hash, address, basename, searchQuery, filterStatus]);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatAmount = (amount: string) => {
        return (Number(amount) / 1e18).toFixed(4);
    };

    const formatTime = (timestamp: string) => {
        return new Date(Number(timestamp) * 1000).toLocaleTimeString();
    };

    const formatDate = (timestamp: string) => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString();
    };

    const getStatusColor = () => {
        // Como seu schema não tem status, assumimos que todas são SUCCESS
        return "bg-green-500/20 text-green-600 border-green-200";
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getPageTitle = () => {
        switch (viewMode) {
            case 'hash':
                return `Transaction ${formatAddress(hash!)}`;
            case 'address':
                return `Address ${formatAddress(address!)}`;
            case 'basename':
                return `Creator ${basename}`;
            default:
                return "TipScan";
        }
    };

    const getPageDescription = () => {
        switch (viewMode) {
            case 'hash':
                return "Transaction details";
            case 'address':
                return "All tips sent and received by this address";
            case 'basename':
                return `Tips for ${creator?.displayName || basename}`;
            default:
                return "Real-time explorer for all tips on TipChain";
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
            {/* Header */}
            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
                <div className="container relative py-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent dark:from-gray-100 dark:via-blue-100 dark:to-purple-100">
                                        {getPageTitle()}
                                    </h1>
                                    <p className="text-muted-foreground">
                                        {getPageDescription()}
                                    </p>
                                </div>
                            </div>

                            {/* Creator Info for basename view */}
                            {viewMode === 'basename' && creator && (
                                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 mt-4">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-4">
                                            {creator.avatarUrl && (
                                                <img
                                                    src={creator.avatarUrl}
                                                    alt={creator.displayName}
                                                    className="h-12 w-12 rounded-full"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg">{creator.displayName}</h3>
                                                <p className="text-muted-foreground">@{creator.basename}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{creator.bio}</p>
                                                <div className="flex space-x-4 mt-2 text-sm">
                                                    <span>{creator.tipCount} tips received</span>
                                                    <span>{formatAmount(creator.totalAmountReceived)} ETH total</span>
                                                    <span>{creator.tippedByCount} supporters</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Transaction Info for hash view */}
                            {viewMode === 'hash' && tips[0] && (
                                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 mt-4">
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-muted-foreground">From</label>
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4" />
                                                    <Link
                                                        to={`/scan/address/${tips[0].from.address}`}
                                                        className="font-mono hover:text-blue-600 transition-colors"
                                                    >
                                                        {tips[0].from.basename || formatAddress(tips[0].from.address)}
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(tips[0].from.address)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-muted-foreground">To</label>
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4" />
                                                    <Link
                                                        to={`/scan/address/${tips[0].to.address}`}
                                                        className="font-mono hover:text-blue-600 transition-colors"
                                                    >
                                                        {tips[0].to.basename || formatAddress(tips[0].to.address)}
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(tips[0].to.address)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-muted-foreground">Amount</label>
                                                <p className="font-bold text-green-600">
                                                    {formatAmount(tips[0].amount)} ETH
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-muted-foreground">Date</label>
                                                <p className="text-sm">
                                                    {formatDate(tips[0].timestamp)} {formatTime(tips[0].timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                        {tips[0].message && (
                                            <div className="mt-4">
                                                <label className="text-sm text-muted-foreground">Message</label>
                                                <p className="text-sm mt-1 p-2 bg-gray-50 rounded dark:bg-gray-700">
                                                    {tips[0].message}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <Link to="/explore">
                            <Button className="group mt-4 lg:mt-0">
                                <span className="flex items-center">
                                    Explore Creators
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="container py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {viewMode === 'all' ? 'Total Tips' : 'Filtered Tips'}
                                    </p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {viewMode === 'all' ? stats.totalTips.toLocaleString() : stats.filteredTips}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-500/10">
                                    <Hash className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {viewMode === 'all' ? 'Total Volume' : 'Filtered Volume'}
                                    </p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {viewMode === 'all' ? stats.totalVolume : stats.filteredVolume} ETH
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-500/10">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {viewMode === 'all' && (
                        <>
                            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Avg Tip Amount
                                            </p>
                                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {stats.avgTipAmount} ETH
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-green-500/10">
                                            <DollarSign className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Last 24h
                                            </p>
                                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {stats.tips24h}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-yellow-500/10">
                                            <Clock className="h-6 w-6 text-yellow-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </section>

            {/* Search and Filters - Only show in all view */}
            {viewMode === 'all' && (
                <section className="container py-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by address, basename, display name, transaction hash, or message..."
                                className="pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Tips Table */}
            <section className="container py-6 flex-1">
                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                            {viewMode === 'hash' ? 'Transaction Details' : 'Tips'}
                        </CardTitle>
                        <CardDescription>
                            {viewMode === 'hash'
                                ? 'Single transaction view'
                                : viewMode === 'all'
                                    ? 'All tips executed on the TipChain platform'
                                    : `Tips involving ${viewMode === 'address' ? 'this address' : 'this creator'}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : tips.length === 0 ? (
                            <div className="text-center py-12">
                                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No tips found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                                                From
                                            </th>
                                            <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                                                To
                                            </th>
                                            <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                                                Amount
                                            </th>
                                            <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                                                Message
                                            </th>
                                            <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                                                Time
                                            </th>
                                            <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tips.map((tip) => (
                                            <tr key={tip.id} className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <Link
                                                            to={`/scan/address/${tip.from.address}`}
                                                            className="font-mono text-sm hover:text-blue-600 transition-colors"
                                                        >
                                                            {tip.from.basename || formatAddress(tip.from.address)}
                                                        </Link>
                                                    </div>
                                                    {tip.from.displayName && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {tip.from.displayName}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <Link
                                                            to={`/scan/address/${tip.to.address}`}
                                                            className="font-mono text-sm hover:text-blue-600 transition-colors"
                                                        >
                                                            {tip.to.basename || formatAddress(tip.to.address)}
                                                        </Link>
                                                    </div>
                                                    {tip.to.displayName && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {tip.to.displayName}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-green-600">
                                                            {formatAmount(tip.amount)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ETH
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                                                        {tip.message || "No message"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {formatTime(tip.timestamp)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(tip.timestamp)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="flex space-x-2">
                                                        <Link to={`/scan/hash/${tip.transactionHash}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(tip.transactionHash)}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 mt-16">
                <div className="container py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                                <Zap className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                TipChain
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 TipChain. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}