import React from 'react'
import Hero from '../components/Hero'
import FeaturedDestination from '../components/FeaturedDestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonials'
import Newsletter from '../components/Newsletter'

const Home = () => {
  
  return (
    <>
      <Hero />
      <FeaturedDestination/>
      <ExclusiveOffers/>
      <Testimonial/>
      <Newsletter/>
    </>
  )
}

export default Home