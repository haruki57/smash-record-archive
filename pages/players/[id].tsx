import React from 'react'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'

type Props = {
  id: number;
  smashgg_id: number;
  name: string;
  name_eng: string;
}
const Player: React.FC<Props> = props => {
  return (
    <Layout>
      <div>
        {`${props.name} / ${props.name_eng}`}
        </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`http://localhost:3100/api/players/${context.params.id}`)
  const data = await res.json()
  return { props: { ...data } }
}

export default Player
