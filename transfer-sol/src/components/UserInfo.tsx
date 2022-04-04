import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FC, useEffect, useState } from 'react';
import * as web3 from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';


export const UserInfo: FC = () => {
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState(0)
    useEffect(() => {
        getAccountInfo()
    }, [publicKey])
    const getAccountInfo = async () => {
        if (!publicKey) return
        var connection = new web3.Connection(
            web3.clusterApiUrl('devnet'),
            'confirmed',
        );
        const amount = await connection.getBalance(publicKey);
        setBalance(amount)
        console.log('amount', amount)
    }

    return (
        <div className='Containers'>
            <WalletMultiButton />
            <button style={{
                border: '2px solid black',
                background: 'transparent',
                color: 'white',
                fontWeight: 600,
                borderRadius: '5px',
                padding: '15px',
            }}>{`Wallet Balance: ${balance / 1000000000}`}</button>
        </div>
    )

} 