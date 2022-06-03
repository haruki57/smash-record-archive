import React from 'react'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

const Blog: React.FC = props => {
  return (
    <Layout>
      <div>{JSON.stringify(props)}</div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://localhost:3000/api/players/5353')
  const feed = await res.json()
  return {
    props: { feed },
  }
}

export default Blog
