import React from 'react';

interface OgHeroProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
}

export const OgHero: React.FC<OgHeroProps> = ({
  title = "TipChain",
  subtitle = "Support Creators with Multi-chain Tipping",
  tagline = "Gasless transactions • Social login • Multi-chain support"
}) => {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background container */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: '100px',
          width: '1000px',
          height: '430px',
          backgroundColor: '#1A1A1A',
          border: '2px solid #333333',
          borderRadius: '20px'
        }}
      />
      
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          top: '200px',
          left: '200px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: '#333333',
          opacity: 0.3
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '400px',
          left: '1000px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          backgroundColor: '#333333',
          opacity: 0.3
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '150px',
          left: '800px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: '#333333',
          opacity: 0.3
        }}
      />
      
      {/* Logo */}
      <div
        style={{
          position: 'relative',
          marginBottom: '40px'
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="60" stroke="#FFFFFF" strokeWidth="4" fill="none" />
          <path d="M60 20L80 40H70V80H50V40H40L60 20Z" fill="#FFFFFF" />
          <path d="M40 100L60 120L80 100H70V80H50V100H40Z" fill="#FFFFFF" />
          <circle cx="60" cy="60" r="8" fill="#FFFFFF" />
        </svg>
      </div>
      
      {/* Title */}
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          margin: '0 0 20px 0',
          textAlign: 'center'
        }}
      >
        {title}
      </h1>
      
      {/* Subtitle */}
      <p
        style={{
          fontSize: '24px',
          color: '#FFFFFF',
          margin: '0 0 30px 0',
          textAlign: 'center'
        }}
      >
        {subtitle}
      </p>
      
      {/* Tagline */}
      <p
        style={{
          fontSize: '18px',
          color: '#CCCCCC',
          margin: '0',
          textAlign: 'center'
        }}
      >
        {tagline}
      </p>
    </div>
  );
};

export default OgHero;