import {Button} from "@material-ui/core";
import { LAMPORTS_PER_SOL, TransactionSignature, PublicKey } from '@solana/web3.js';
import {useWallet} from '@solana/wallet-adapter-react';
import {BN, Program, utils, web3} from '@project-serum/anchor';
import {useNotify} from '../Utils/notify';
import Select from 'react-select';
import React, {FC, useState, useEffect} from 'react';
import {GetProvider} from '../Utils/utils';
import {programID, dummyMintPk, dummyMintPkBump} from '../../config/config.js';
import idl from '../../config/spl_token.json';

import "./style.scss";
const { SystemProgram } = web3;
const { TOKEN_PROGRAM_ID, Token, ASSOCIATED_TOKEN_PROGRAM_ID } = require("@solana/spl-token");

const AirDrop = ({tokenName, reload, setReload, network, setNetwork}) => {
  const wallet = useWallet();
  const notify = useNotify();
  const [provider, connection] = GetProvider(wallet, network);
  const publicKey = provider.wallet.publicKey;
  const [selectedOption, setSelectedOption] = useState("https://api.devnet.solana.com");
  const [airdropPk, setAirdropPk] = useState("CONNECT WALLET");
  const [splAmount, setSplAmount] = useState(1000);
  const options = [
    { value: 'https://api.devnet.solana.com', label: 'DEVNET' },
  ]

  useEffect(() => {
    if(wallet.publicKey) {
        setAirdropPk(wallet.publicKey.toString()); 
    }
  }, [wallet.publicKey]);

  const handleChange = (option) => {
    setSelectedOption(option);
    setNetwork(option.value);
    setReload(!reload);
  };

  const handleChangeSplAmount = (event) => {
    setSplAmount(event.target.value);
  }

  const handleChangeAirdropPk = (event) => {
    setAirdropPk(event.target.value);
  };

  const handleFocusAirdropPk = (event) => {
    setAirdropPk("");
  }

  const handleSubmitSpl = async (event) => {
    event.preventDefault();
    await airdropSplTokens(splAmount, dummyMintPk, dummyMintPkBump);
  };


  async function airdropSplTokens(amount, mintPda, mintPdaBump) {
    let signature = '';
    
    try {
      const [provider, connection] = GetProvider(wallet, network);
      const program = new Program(idl, programID, provider);
      const receiver = new PublicKey(airdropPk);
      let amountToAirdrop = new BN(amount * 1000000);

      let associatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPda,
        receiver,
        true
      );

      signature = await program.rpc.airdrop(
        mintPdaBump,
        amountToAirdrop,
        {
          accounts: {
            mint: mintPda,
            destination: associatedTokenAccount,
            payer: provider.wallet.publicKey,
            receiver: receiver, 
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: web3.SYSVAR_RENT_PUBKEY
          },
          signers: [],
        }
      );
      notify('info', `${tokenName} Airdrop requested:`, signature, network);
      await connection.confirmTransaction(signature, 'processed');
      notify('success', `${tokenName} Airdrop successful!`, signature, network);
      setReload(!reload);
    } catch (err) {
      notify('error', `${tokenName} Airdrop failed! ${err?.message}`, signature, network);
    }
  }

  return (
    <div className="airdrop-container">
      <div className="airdrop-wrapper">
        <h3>Network selection</h3>
        <div className="network-dropdown-wrapper">
          <Select
            className="network-dropdown navbar-button react-select-container"
            classNamePrefix="react-select"
            onChange={handleChange}
            defaultValue={options[0]}
            options={options}
            menuPlacement="auto"
            menuPosition="fixed"
            isSearchable={false}
            theme={(theme) => ({
              ...theme,
              borderRadius: 0,
              colors: {
                ...theme.colors,
                primary: 'black',
                primary25: "#f0f0f0"
              },
            })}
           />
         </div>
        <h3>Address for airdrop</h3>
        <p>The address where the {tokenName} will be sent to.</p>
        <input
          name="airdropPk"
          type="text"
          value={airdropPk}
          onChange={handleChangeAirdropPk}
          onFocus={handleFocusAirdropPk}
          disabled={!publicKey}
          className="airdrop-pk-input stake-input borrower-pk credix-button MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary balance-button"
        />
        <h3>{tokenName} airdrop</h3>
         <form className="form-row">
           <input
             onChange={handleChangeSplAmount}
             defaultValue={1000}
             type="number"
             step="100"
             disabled={!publicKey}
             className="navbar-button stake-input credix-button MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary balance-button"
            />
            <Button
                variant="contained"
                className="stake-submit MuiButton-containedPrimary balance-button credix-button"
                onClick={handleSubmitSpl}
                disabled={!publicKey}
            >
             Send {tokenName}
            </Button>
         </form>
       </div>
    </div>
  );
};

export default AirDrop;
