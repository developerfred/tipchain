import { sdk } from '@farcaster/miniapp-sdk'

export class FarcasterActions {
    static async openUrl(url: string) {
        if (await sdk.isInMiniApp()) {
            await sdk.actions.openUrl(url)
        } else {
            window.open(url, '_blank')
        }
    }

    static async closeApp() {
        if (await sdk.isInMiniApp()) {
            await sdk.actions.close()
        }
    }

    static async shareUrl(url: string) {
        if (await sdk.isInMiniApp()) {            
            await sdk.actions.openUrl(url)
        } else if (navigator.share) {            
            await navigator.share({ url })
        } else {            
            await navigator.clipboard.writeText(url)
            alert('Link copied to clipboard!')
        }
    }
}