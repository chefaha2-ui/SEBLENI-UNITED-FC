import React from 'react';
import CommunityFeed from '../components/CommunityFeed';

const Community = () => {
  return (
    <div className="px-4 md:px-16 py-12 max-w-3xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none text-deep-black">Fan Community</h1>
        <p className="text-slate-gray font-medium uppercase tracking-widest text-xs mt-4">
          The heartbeat of Sebleni United. Share your passion.
        </p>
      </div>

      <CommunityFeed />
    </div>
  );
};

export default Community;
