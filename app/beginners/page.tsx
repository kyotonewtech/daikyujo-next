"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Clock, MapPin, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TabNav from "@/components/beginners/TabNav";
import NoticeBox from "@/components/beginners/NoticeBox";
import InfoCard from "@/components/beginners/InfoCard";
import ExpandableDetail from "@/components/beginners/ExpandableDetail";
import ChecklistItem from "@/components/beginners/ChecklistItem";
import type { TabId, Tab } from "@/types/beginners";

const tabs: Tab[] = [
  { id: "top", label: "トップ" },
  { id: "guide", label: "ご利用案内" },
  { id: "rules", label: "注意・お願い" },
  { id: "history", label: "歴史とアクセス" },
];

export default function BeginnersPage() {
  const [activeTab, setActiveTab] = useState<TabId>("top");

  // URLクエリパラメータからタブを設定
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as TabId | null;
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);

      // ハッシュがある場合は少し遅延してスクロール
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash) {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 300);
    }
  }, []);

  return (
    <>
      <Header />
      <section className="py-32 px-6 bg-background min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* ページタイトル */}
          <div className="text-center mb-12 md:mb-20">
            <h1 className="font-shippori text-3xl md:text-4xl font-bold mb-3 text-gray-800">
              初めての方へ
            </h1>
            <span className="block text-xs text-accent tracking-[0.3em]">
              FOR BEGINNERS
            </span>
          </div>

          {/* タブナビゲーション */}
          <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* タブコンテンツ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {activeTab === "top" && <TopContent />}
              {activeTab === "guide" && <GuideContent />}
              {activeTab === "rules" && <RulesContent />}
              {activeTab === "history" && <HistoryContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </>
  );
}

// Tab 1: トップ
function TopContent() {
  return (
    <div className="space-y-8">
      {/* 営業時間のご案内 */}
      <NoticeBox variant="info" title="営業時間のご案内">
        <p className="mb-2">
          <strong>定休日:</strong> 月曜日・第3火曜日
        </p>
        <p className="mb-2">
          年末年始・祝日の営業については、お電話にてご確認ください。
        </p>
        <p className="flex items-center gap-2 font-bold mt-3">
          <Phone size={16} />
          TEL: 075-561-3568
        </p>
      </NoticeBox>

      {/* 見出し */}
      <div className="text-center">
        <h2 className="font-shippori text-2xl md:text-3xl font-bold mb-5 mt-10 text-gray-800">
          京都で「大弓」を体験
        </h2>
        <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
          160年を超える歴史を持つ園山大弓場では、初心者の方も気軽に大弓体験をお楽しみいただけます。
          <br />
          手ぶらでお越しいただけ、必要な道具は全てこちらでご用意しております。
        </p>
      </div>

      {/* 料金・時間カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          title="料金"
          description="2,700円 / 16射（指導・道具レンタル込み）"
          icon={<Coins size={32} />}
          delay={0}
        />
        <InfoCard
          title="所要時間"
          description="30〜60分程度（混雑状況により変動）"
          icon={<Clock size={32} />}
          delay={0.1}
        />
      </div>

      {/* 注意書き */}
      <div className="text-center text-gray-600 text-sm">
        ※ 週末・祝日は混雑が予想されます。事前のご予約をおすすめいたします。
      </div>
    </div>
  );
}

// Tab 2: ご利用案内
function GuideContent() {
  return (
    <div className="space-y-10">
      {/* 服装・持ち物 */}
      <div>
        <h2 className="font-shippori text-2xl font-bold mb-5 mt-10 text-gray-800 border-l-4 border-accent pl-4">
          服装・持ち物
        </h2>
        <ul className="space-y-4">
          <ChecklistItem
            text="手ぶらでOK！必要な道具は全てご用意しております"
            delay={0}
          />
          <ChecklistItem
            text="動きやすい服装でお越しください"
            delay={0.1}
          />
          <ChecklistItem
            text="着物でお越しの方は、たすきをご持参ください"
            delay={0.2}
          />
          <ChecklistItem
            text="履物はそのままでも大丈夫です（一部土足禁止エリアあり）"
            delay={0.3}
          />
        </ul>
      </div>

      {/* 体験の流れ */}
      <div>
        <h2 className="font-shippori text-2xl font-bold mb-5 mt-10 text-gray-800 border-l-4 border-accent pl-4">
          体験の流れ
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          園山大弓場の特徴は<strong>「座って射る」</strong>
          スタイルです。軽い弓（約5kg、大学弓道の約半分）を使用し、身体に無理のない姿勢で射ることができます。
          <br />
          初めての方でも、スタッフが丁寧に指導いたしますので、ご安心ください。
        </p>
        <div className="space-y-4">
          <ExpandableDetail summary="初心者・女性・シニアの方へ">
            <p className="mb-3">
              当弓場では軽い弓を使用しておりますので、力に自信のない方でも安全にお楽しみいただけます。
            </p>
            <p>
              スタッフが一から丁寧にご指導いたしますので、初めての方もご安心ください。
            </p>
          </ExpandableDetail>

          <ExpandableDetail summary="経験者の方へ" id="experienced">
            <p className="mb-3">
              園山大弓場の射法は、一般的な弓道とは異なる独自のスタイルです。
              <br />
              <strong>「郷に入っては郷に従い」</strong>
              の精神で、当弓場の作法に従っていただきますようお願いいたします。
            </p>
            <p className="font-medium text-gray-800">
              経験者料金: 初回 2,200円 / 2回目以降 1,200円
            </p>
          </ExpandableDetail>
        </div>
      </div>
    </div>
  );
}

// Tab 3: 注意・お願い
function RulesContent() {
  return (
    <div className="space-y-8">
      {/* 警告ボックス */}
      <NoticeBox variant="warning" title="安全のために">
        <p className="mb-2">
          弓は本来、武器となり得るものです。
        </p>
        <p>
          安全にご体験いただくため、スタッフの指示には必ず従っていただきますようお願いいたします。
          <br />
          指示に従っていただけない場合は、体験を中止させていただく場合がございます。
        </p>
      </NoticeBox>

      {/* 展開可能セクション */}
      <div className="space-y-4">
        <ExpandableDetail summary="14歳以下のお子様について">
          <p className="mb-3 font-medium text-gray-800">
            <strong>14歳以下のお子様は体験をお断りしております。</strong>
          </p>
          <p className="mb-3">
            理由:
            <br />
            ・安全管理の観点
            <br />
            ・弓のサイズや引く力の問題
          </p>
          <p>
            保護者の方が同伴されても、この方針は変わりませんので、あらかじめご了承ください。
          </p>
        </ExpandableDetail>

        <ExpandableDetail summary="体験をお断りする場合">
          <p className="mb-2">
            以下に該当する場合、体験をお断りすることがございます:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>酒気を帯びている方</li>
            <li>体調が優れない方</li>
            <li>スタッフの指示に従っていただけない方</li>
            <li>14歳以下のお子様</li>
          </ul>
          <p className="mt-3">
            体験中であっても、上記に該当すると判断した場合は、その場で体験を終了させていただきます。
          </p>
        </ExpandableDetail>

        <ExpandableDetail summary="免責事項">
          <p className="mb-3">
            これまで初心者の方で大きな怪我をされた方はおりませんが、万が一怪我をされた場合、以下の場合には責任を負いかねます:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>ご本人の不注意による怪我</li>
            <li>スタッフの指示を守らなかったことによる怪我</li>
          </ul>
          <p className="mt-3">
            正しい姿勢・技術で射ることが、安全に体験いただくための最も重要なポイントです。
          </p>
        </ExpandableDetail>
      </div>
    </div>
  );
}

// Tab 4: 歴史とアクセス
function HistoryContent() {
  return (
    <div className="space-y-10">
      {/* 歴史 */}
      <div>
        <h2 className="font-shippori text-2xl font-bold mb-5 mt-10 text-gray-800 border-l-4 border-accent pl-4">
          歴史
        </h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            園山大弓場は<strong>文久二年（1862年）創業</strong>
            、160年を超える歴史を持つ伝統ある弓道場です。
          </p>
          <p>
            初代・園山より受け継がれ、現在は六代目が運営を引き継いでおります。
          </p>
          <p>
            単なる「レクリエーション」としてだけでなく、
            <strong>「武道としての修練・心の鍛錬の場」</strong>
            としても、多くの方にご利用いただいております。
          </p>
        </div>
      </div>

      {/* アクセス */}
      <div>
        <h2 className="font-shippori text-2xl font-bold mb-5 mt-10 text-gray-800 border-l-4 border-accent pl-4">
          アクセス
        </h2>
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <MapPin size={20} className="text-accent" />
                所在地
              </h3>
              <p className="text-gray-700 ml-7">
                〒605-0073
                <br />
                京都市東山区円山公園北林
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <MapPin size={20} className="text-accent" />
                交通アクセス
              </h3>
              <ul className="text-gray-700 space-y-2 ml-7">
                <li>京阪本線「祇園四条駅」より徒歩約15分</li>
                <li>阪急「河原町」駅より徒歩約20分</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Phone size={20} className="text-accent" />
                お問い合わせ
              </h3>
              <p className="text-gray-700 ml-7 font-medium">TEL: 075-561-3568</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
