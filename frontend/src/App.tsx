import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './styles.module.css'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'

type Canceler = () => void
const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>()
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error))
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current()
        cancelerRef.current = undefined
      }
    }
  }, dependencies)
}

const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>()
  const [contract, setContract] = useState<main.Main>()
  useAffect(async () => {
    const details_ = await ethereum.connect('metamask')
    if (!details_) return
    setDetails(details_)
    const contract_ = await main.init(details_)
    if (!contract_) return
    setContract(contract_)
  }, [])
  return useMemo(() => {
    if (!details || !contract) return
    return { details, contract }
  }, [details, contract])
}

export const App = () => {
  // const wallet = useWallet()

  const createCollection = async () => {

    const send = {
      name: "test",
      count: 2
    }

    const resp = await fetch(
        "http://127.0.0.1:5000/createCollection",
        {
          method: 'POST',
          body: JSON.stringify(send),
        }
      )
    const data = await resp
    console.log(data)
  } 

  const getCollectionNames = async () => {

    const resp = await fetch(
        "http://127.0.0.1:5000/getCollectionNames",
        {
          method: 'GET'
        }
      )
    const data = await resp.json()
    console.log(data)
  }

  const mintCard = async () => {
    const send = {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      tokenURI: "test0",
      collectionId: 0
    }

    const resp = await fetch(
        "http://127.0.0.1:5000/mintCard",
        {
          method: 'POST',
          body: JSON.stringify(send),
        }
      )
    const data = await resp
    console.log(data)
  }

  const getAllCollections = async () => {
    const resp = await fetch(
        "http://127.0.0.1:5000/getAllCollections",
        {
          method: 'GET'
        }
      )
    const data = await resp
    console.log(data)
  }

  return (
    <div className={styles.body}>
      <h1>Welcome to Pokémon TCG </h1>
      <button onClick={createCollection} > createCollection </button> 
      <button onClick={getCollectionNames} > getCollectionNames </button> 
      <button onClick={mintCard} > mintCard </button>
      <button onClick={getAllCollections} > getAllCollections </button>
    </div>
  )
}
