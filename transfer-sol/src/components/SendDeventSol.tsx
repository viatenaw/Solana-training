import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import React, { FC, useCallback, useState } from 'react';

export const SendDeventSol: FC = () => {
    const { connection } = useConnection();
    // const cluster = "http://devnet.solana.com";
    // const connection = new Connection(cluster, "confirmed");
    const { publicKey, sendTransaction } = useWallet();
    const [ receiversAddress, setReceiversAddress ] = useState<any>()
    const [ amount, setAmount ] = useState<any>()

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log ('handleAddressChange', e.target.value)
        setReceiversAddress(e.target.value)
    }
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log ('handleChange', e.target.value)
        setAmount(Number(e.target.value))
    }
    const sendSol = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();
        console.log('receiversAddress', receiversAddress)
        const destPubkey = new PublicKey(receiversAddress);
        
        console.log('publicKey', publicKey, destPubkey, amount)

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: destPubkey,
                lamports: amount * 1000000000,
            })
        );
        
        try {
            const signature = await sendTransaction(transaction, connection);
    
            await connection.confirmTransaction(signature, 'processed');
            console.log('SENT!!')
        } catch (error) {
            console.error('error!!', error)   
        }
    }, [publicKey, sendTransaction, connection, receiversAddress, amount]);
    return(
        <div className='Containers TransactionContiner'>
            <input type={'number'} className='InputFields' value={amount} placeholder='Amount' onChange={e => {handleAmountChange(e)}}></input>
            <input type={'string'}  className='InputFields' value={receiversAddress} placeholder="receiver's address" onChange={e => {handleAddressChange(e)}}></input>
            <button  style={{
                    border: 'none',
                    background: 'black',
                    color: 'white',
                    borderRadius: '5px',
                    padding: '10px',
            }} onClick={sendSol}>
                Send
            </button>
        </div>
    )
    
} 