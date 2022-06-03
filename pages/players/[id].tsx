import React from 'react'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'

type Props = {}
const Player: React.FC<Props> = props => {
  return (
    <Layout>
      <div>
        {JSON.stringify(props)}
        </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`http://localhost:3000/api/players/${context.params.id}`)
  const data = await res.json()
  return { props: { ...data } }
}

export default Player
