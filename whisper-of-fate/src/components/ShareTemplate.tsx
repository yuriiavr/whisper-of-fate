import React from 'react';
import type { TarotCard } from '../data/tarotCards';

const getTodayDate = () => {
  return new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
};

interface ShareTemplateProps {
  drawnCards: { card: TarotCard; isReversed: boolean }[];
  quote: string;
}

export const ShareTemplate: React.FC<ShareTemplateProps> = ({ drawnCards, quote }) => {
  return (
    <div 
      id="share-story-template"
      style={{
        width: '1080px',
        height: '1920px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '100px 60px',
        color: 'white',
        fontFamily: 'sans-serif',
        position: 'relative',
        left: '0',
        top: 0,
        background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '70px', fontWeight: 'extrabold', marginBottom: '20px', color: '#f59e0b' }}>
          Оракул "Whisper of Fate"
        </h1>
        <p style={{ fontSize: '40px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          ПЕРЕДБАЧЕННЯ НА {getTodayDate()}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '900px' }}>
        {drawnCards.map((drawn, index) => (
          <div key={index} style={{ textAlign: 'center', width: '260px' }}>
            <img 
              src={drawn.card.image} 
              alt={drawn.card.name}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '20px',
                border: '4px solid #8b5cf6',
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
                transform: drawn.isReversed ? 'rotate(180deg)' : 'none',
              }}
            />
            <p style={{ fontSize: '30px', fontWeight: 'bold', marginTop: '20px', textTransform: 'uppercase' }}>
              {drawn.card.name}
              {drawn.isReversed && <span style={{ color: '#ef4444' }}> (П)</span>}
            </p>
          </div>
        ))}
      </div>

      <div style={{ 
        background: 'rgba(0,0,0,0.5)', 
        padding: '50px', 
        borderRadius: '30px', 
        width: '100%', 
        textAlign: 'center',
        border: '2px solid #a78bfa'
      }}>
        <p style={{ fontSize: '50px', fontWeight: '600', fontStyle: 'italic', lineHeight: '1.4', color: '#ddd' }}>
          "{quote}"
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '30px', color: '#a1a1aa', marginBottom: '10px' }}>Отримай свою пораду тут:</p>
        <p style={{ fontSize: '45px', fontWeight: 'bold', color: '#f59e0b' }}>
          whisper-of-fate.vercel.app
        </p>
      </div>
    </div>
  );
};