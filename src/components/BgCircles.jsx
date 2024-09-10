import React from 'react';
import { images } from '../utils/images';

export default function BgCircles() {
  return (
    <>
      <div className="relative">
        <img
          className="absolute w-[800px] -top-[290px] -left-[240px] rotate-[220deg] lg:-top-[300px] lg:-left-[350px] lg:rotate-[230deg]"
          src={images.mainCircle}
          alt="메인구체1"
        />
        <img
          className="absolute w-[800px] top-[180px] -right-[250px] rotate-[40deg] lg:top-[400px] lg:-right-[400px] lg:rotate-[40deg]"
          src={images.mainCircle}
          alt="메인구체3"
        />
        <img
          className="absolute w-[800px] top-[600px] -left-[240px] rotate-[165deg] lg:top-[1200px] lg:-left-[450px] lg:rotate-[140deg]"
          src={images.mainCircle}
          alt="메인구체2"
        />
        <img
          className="absolute w-[800px] top-[1400px] -right-[230px] rotate-[50deg] lg:top-[2000px] lg:-right-[400px] lg:rotate-[60deg]"
          src={images.mainCircle}
          alt="메인구체4"
        />
      </div>
    </>
  );
}
