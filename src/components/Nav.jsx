import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { images } from '../utils/images';

const DETAIL_NAV = [
  { idx: 0, title: '서비스 소개' },
  { idx: 1, title: '이용방법' },
  { idx: 2, title: '문의하기' },
];

const Nav = ({ scrollRef }) => {
  const [scrolling, setScrolling] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navbg = `Nav fixed z-20 top-0 left-0 right-0 flex justify-between items-center y-3 ${
    scrolling ? 'nav-bg-scrolled' : ''
  }`;

  const [navIndex, setNavIndex] = useState(null);
  const navRef = useRef([]);

  useEffect(() => {
    scrollRef?.current[navIndex]?.scrollIntoView({ behavior: 'smooth' });
    setNavIndex(null);
  }, [scrollRef, navIndex]);

  useEffect(() => {
    const changeNavBtnStyle = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let isAnyActive = false;
      scrollRef?.current.forEach((ref, idx) => {
        const elementBottom = ref.offsetTop + ref.clientHeight;
        if (ref.offsetTop <= scrollPosition && elementBottom > scrollPosition) {
          navRef?.current.forEach(ref => {
            ref.classList.remove('active');
          });
          navRef.current[idx].classList.add('active');
          isAnyActive = true;
        }
      });
      if (!isAnyActive) {
        navRef?.current.forEach(ref => {
          ref.classList.remove('active');
        });
      }
    };

    window.addEventListener('scroll', changeNavBtnStyle);

    return () => {
      window.removeEventListener('scroll', changeNavBtnStyle);
    };
  }, [scrollRef]);

  const handleNavItemClick = idx => {
    if (location.pathname === '/') {
      setNavIndex(idx);
    } else {
      navigate('/');
      setNavIndex(idx);
    }
  };

  return (
    <>
      <div className={navbg}>
        <div className="flex justify-between w-10/12 mx-auto mt-4 text-lg">
          <Link
            to="/"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}>
            <div className="fontBold flex flex-row">
              <span className="text-[#5e75ee] pr-1.5">서식 유지</span> 맞춤법 검사기
            </div>
          </Link>
          <div className="flex justify-between text-base text-[#a9a9a9] my-auto">
            {DETAIL_NAV.map(({ idx, title }) => (
              <div
                className={`navItem mx-3 px-1 cursor-pointer ${idx === navIndex ? 'active' : ''}`}
                key={idx}
                ref={ref => (navRef.current[idx] = ref)}
                onClick={() => handleNavItemClick(idx)}>
                {title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;
