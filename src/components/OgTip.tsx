import React from 'react';

interface OgTipProps {
  creator?: string;
  amount?: string;
  currency?: string;
  message?: string;
  chain?: string;
}

export const OgTip: React.FC<OgTipProps> = ({
  creator = "Creator Name",
  amount = "10",
  currency = "ETH",
  message = "Thanks for your amazing content!",
  chain = "Base"
}) => {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background elements */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, #33333333 25%, transparent 25%), linear-gradient(-45deg, #33333333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #33333333 75%), linear-gradient(-45deg, transparent 75%, #33333333 75%)',
          backgroundSize: '100px 100px',
          opacity: 0.3
        }}
      />
      
      {/* Main container */}
      <div
        style={{
          width: '900px',
          height: '400px',
          backgroundColor: '#1A1A1A',
          border: '2px solid #333333',
          borderRadius: '20px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Tip icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px'
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 8L28 16H24V24H16V16H12L20 8Z" fill="#000000"/>
            <path d="M12 32L20 40L28 32H24V24H16V32H12Z" fill="#000000"/>
            <circle cx="20" cy="20" r="3" fill="#000000"/>
          </svg>
        </div>
        
        {/* Amount */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginBottom: '20px'
          }}
        >
          {amount} {currency}
        </div>
        
        {/* Message */}
        <p
          style={{
            fontSize: '24px',
            color: '#FFFFFF',
            textAlign: 'center',
            margin: '0 0 30px 0',
            maxWidth: '600px'
          }}
        >
          "{message}"
        </p>
        
        {/* Creator and chain info */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ color: '#CCCCCC', fontSize: '18px' }}>To:</span>
            <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold' }}>
              {creator}
            </span>
          </div>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ color: '#CCCCCC', fontSize: '18px' }}>On:</span>
            <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold' }}>
              {chain}
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#FFFFFF"/>
          <path d="M16 8L20 12H18V16H14V12H12L16 8Z" fill="#000000"/>
          <path d="M12 24L16 28L20 24H18V16H14V24H12Z" fill="#000000"/>
          <circle cx="16" cy="16" r="2" fill="#000000"/>
        </svg>
        
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          TipChain
        </span>
        
        <span
          style={{
            color: '#CCCCCC',
            fontSize: '16px'
          }}
        >
          tipchain.aipop.fun
        </span>
      </div>
    </div>
  );
};

export default OgTip;