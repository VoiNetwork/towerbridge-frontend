import { ArrowRightIcon } from "@chakra-ui/icons";
import { Button, Center, Input } from "@chakra-ui/react";
import { useState } from "react";
import { loadStdlib, ALGO_MakeAlgoSignerConnect as MakeAlgoSignerConnect } from '@reach-sh/stdlib';
import * as lockBackend from './../../lock.main.mjs';
import * as mintBackend from './../../mint.main.mjs';
import { IBaseResult, ISignTxnsResult } from "@agoralabs-sh/algorand-provider";
import algosdk from "algosdk";
const algoStdLib = loadStdlib('ALGO');

// algoStdLib.setProviderByName("TestNet");

const voiStdLib = loadStdlib('ALGO');
// voiStdLib.setProviderByEnv({
//     ALGO_SERVER: 'https://testnet-api.voi.nodly.io',
//     ALGO_PORT: '',
//     ALGO_TOKEN_HEADER: 'X-Algo-API-Token',
//     ALGO_TOKEN: '',
//     ALGO_INDEXER_SERVER: 'https://testnet-idx.voi.nodly.io',
//     ALGO_INDEXER_PORT: '',
//     ALGO_INDEXER_TOKEN_HEADER: 'X-Indexer-API-Token',
//     ALGO_INDEXER_TOKEN: '',
//     REACH_ISOLATED_NETWORK: 'no',
//     ALGO_NODE_WRITE_ONLY: 'yes',
// });

const algodClient = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud/", "");
const voidClient = new algosdk.Algodv2("", "https://testnet-api.voi.nodly.io", "");

class WalletProvider {
    public address: string;

    constructor(address: string) {
        this.address = address;
    }

    public async connect(): Promise<string> {
        console.log("getAddr")
        return this.address;
    }

    public async signTransaction(txns: string[]): Promise<(string | null)[]> {
        console.log("signTxns")
        //@ts-ignore
        const result: IBaseResult & ISignTxnsResult = await window.algorand.signTxns(txns);
        return result.stxns;
    }

}

type Account = {
    address: string,
    name: string
}

export default function Bridge() {

    const [account, setAccount] = useState<Account | null>(null);
    const [quantity, setQuantity] = useState("");
    const [destinationAddress, setDestinationAddress] = useState("");
    const [isBridged, setBridged] = useState(false);
    const [isClaimed, setClaimed] = useState(false);

    async function onClickConnectWallet() {
        try {
            //@ts-ignore
            const result: IBaseResult & IEnableResult = await window.algorand.enable({
                id: 'kibisis',
            });

            console.log(result);
            setAccount(result.accounts[0])

        } catch (error) {
            //TODO: Tell user to open Kibisis
            console.error(error)
        }
    }

    async function onClickBridge() {

        try {
            // algoStdLib.setWalletFallback(
            //     algoStdLib.walletFallback({
            //         providerEnv: 'TestNet',
            //         WalletConnect: MakeAlgoSignerConnect(new WalletProvider(account?.address || ''), "")
            //     })
            // );
            algoStdLib.setWalletFallback(algoStdLib.walletFallback({
                providerEnv: 'TestNet', MyAlgoConnect: MakeAlgoSignerConnect(new WalletProvider(account?.address || ''), 'TestNet')
            }));
            console.log("setWalletFallback")
        } catch (error) {
            console.error(error);
        }

        console.log(JSON.stringify(quantity));

        let numberQuantity = parseInt(quantity) * 1000000;

        console.log(JSON.stringify(numberQuantity));

        const acc = await algoStdLib.getDefaultAccount();

        console.log(JSON.stringify(acc));

        const ctcLock = acc.contract(lockBackend, 568599939);
        await ctcLock.a.UserAPI.bridgeToken(algoStdLib.parseCurrency(numberQuantity), destinationAddress);
        setBridged(true);
    }

    async function onClickClaim() {
        let numberQuantity = parseInt(quantity) * 10 ^ 6;

        const acc = await voiStdLib.connectAccount({ addr: destinationAddress });

        const ctcMint = acc.contract(mintBackend, 26169151);
        await ctcMint.a.UserAPI.mintToken(voiStdLib.parseCurrency(numberQuantity), account?.address, "txid".padEnd(52, "\0"), 0);
        setClaimed(true)
    }

    return (
        <div className='w-full h-full flex flex-col gap-10'>
            <div className='flex flex-row justify-around pt-8'>
                <div>Tower Bridge</div>
                <div>Bridge USDC</div>
                {account ?
                    <div>{account.name}</div>
                    :
                    <Button colorScheme='blue' onClick={onClickConnectWallet}>Connect Wallet</Button>
                }
            </div>
            <div className='flex flex-row w-full pt-8'>
                <div className='w-full flex flex-col gap-5'>
                    <div>Algorand</div>
                    <Center>
                        <div className='w-2/3 flex flex-col gap-5'>
                            <Input placeholder='Quantity' value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                            <Input placeholder='Destination Address' value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} />
                            <Button className='mt-5' colorScheme='blue' onClick={onClickBridge}>Bridge</Button>
                            {isBridged && <div>Bridged!</div>}
                        </div>
                    </Center>
                </div>
                <ArrowRightIcon />
                <div className='w-full flex flex-col gap-5'>
                    <div>Voi</div>
                    <Center>
                        <div className='w-2/3 flex flex-col gap-5'>
                            <Button className='mt-5' colorScheme='blue' onClick={onClickClaim}>Claim</Button>
                            {isClaimed && <div>Claimed!</div>}
                        </div>
                    </Center>
                </div>
            </div>
        </div>
    );
}