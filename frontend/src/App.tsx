import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './styles.module.css'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'

const SERVER = "http://127.0.0.1:5001/"

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    console.log(formData)
    const resp = await fetch(
      SERVER+"createCollection",
      {
        method: form.method,
        body: formData
        }
    )
    const data = await resp
    console.log(data)
  }

  const getCollectionNames = async () => {

    const resp = await fetch(
        SERVER+"getCollectionNames",
        {
          method: 'GET'
        }
      )
    const data = await resp.json()
    const ret = []
    for (let k of Object.keys(data)) {
      ret.push(data[k])
    }
    setCollections(ret)
    return ret
  }

  const mintCard = async () => {
    const send = {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      tokenURI: "test0",
      collectionId: 0
    }

    const resp = await fetch(
        SERVER+"mintCard",
        {
          method: 'POST',
          body: JSON.stringify(send),
        }
      )
    const data = await resp
  }

  const getAllCollections = async () => {
    const resp = await fetch(
        SERVER+"getAllCollections",
        {
          method: 'GET'
        }
      )
    const data = await resp
    console.log(data)
  }

  const [collections,setCollections] = useState([]);

  // getCollectionNames()
  // console.log(collections)
  const listNames = () => {
    const listItems = collections.map(name => <li> {name} </li>)
    return <ul>{listItems}</ul>
  } 
  // getCollectionNames()
  // const listedNames = listNames()

  return (
    <div className={styles.body}>
      <h1>Welcome to Pokémon TCG </h1>
      <form method="post" onSubmit={handleSubmit}>
      <label>
        new collection name: <input name="collectionName"/>
      </label>
      <label>
         new collection card count: <input name="collectionCardCount"/>
      </label>
      <button type="submit" > createCollection </button> 
      </form>
      <button onClick={getCollectionNames} > getCollectionNames </button> 
      <button onClick={mintCard} > mintCard </button>
      <button onClick={getAllCollections} > getAllCollections </button>
      <h1> Available collections </h1>
      {listNames()}
    </div>
  )
}
