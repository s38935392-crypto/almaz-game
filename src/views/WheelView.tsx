import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Copy, CheckCircle2 } from 'lucide-react';

export const ReferralsView: React.FC = () => {
  const { user, supabase } = useApp();
  const [copied, setCopied] = useState(false);
  const [realReferrals, setRealReferrals] = useState<any[]>([]);

  const myId = user?.telegram_id || 0;
  const referralLink = `https://t.me/FeeFireomadcharxpalakbot?start=${myId}`;

  useEffect(() => {
    if (myId) {
        supabase.from('users').select('*').eq('referred_by', myId)
            .then(({ data }: any) => data && setRealReferrals(data));
    }
  }, [myId, supabase]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="bg-blue-600 rounded-3xl p-6 text-white">
        <h2 className="text-xl font-bold">Takliflar</h2>
        <p className="text-3xl font-black mt-2">{realReferrals.length}</p>
      </div>
      <div className="bg-white p-4 rounded-2xl border flex items-center justify-between">
        <span className="text-xs truncate mr-2">{referralLink}</span>
        <button onClick={copyToClipboard} className="text-blue-500">
          {copied ? <CheckCircle2 size=20 /> : <Copy size=20 />}
        </button>
      </div>
      <div className="space-y-2">
        {realReferrals.map((ref, i) => (
          <div key={i} className="p-4 bg-white rounded-2xl border flex justify-between">
            <span className="font-bold">@{ref.username}</span>
            <span className="text-green-600">+5 💎</span>
          </div>
        ))}
      </div>
    </div>
  );
};
