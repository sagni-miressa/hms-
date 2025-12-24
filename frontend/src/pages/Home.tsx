import { useState } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeatureTabs } from "@/components/home/FeatureTabs";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Footer } from "@/components/home/Footer";
import { Feature } from "@/types/feature";
import { CandidateTeaserCard } from "@/components/home/CandidateTeaserCard";

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<"recruiters" | "applicants">(
    "recruiters"
  );

  const recruiterFeatures: Feature[] = [
    {
      icon: "auto_graph",
      title: "AI Resume Screening",
      desc: "Save hours of manual review. Our AI automatically parses and ranks resumes based on job descriptions and key skills.",
    },
    {
      icon: "view_kanban",
      title: "Visual Pipelines",
      desc: "Drag-and-drop candidates through custom hiring stages.",
    },
    {
      icon: "calendar_month",
      title: "Smart Scheduling",
      desc: "Let candidates book interview slots that work for everyone.",
    },
    {
      icon: "group_add",
      title: "Collaborative Hiring",
      desc: "Leave feedback and scorecards directly on profiles.",
    },
    {
      icon: "analytics",
      title: "Insightful Analytics",
      desc: "Track time-to-hire and source quality.",
    },
    {
      icon: "hub",
      title: "Job Board Integration",
      desc: "Post to 50+ job boards with one click.",
    },
  ];

  const applicantFeatures: Feature[] = [
    {
      icon: "person_search",
      title: "Job Matching",
      desc: "Get matched with relevant opportunities.",
    },
    {
      icon: "chat",
      title: "Direct Chat",
      desc: "Communicate directly with recruiters.",
    },
    {
      icon: "update",
      title: "Real-time Updates",
      desc: "Track your application status.",
    },
    {
      icon: "emoji_events",
      title: "Career Growth",
      desc: "Access career guidance and mentorship.",
    },
    {
      icon: "work_outline",
      title: "One-click Applications",
      desc: "Apply faster with saved profile.",
    },
    {
      icon: "badge",
      title: "Verified Employers",
      desc: "Work with trusted companies.",
    },
  ];

  const features =
    activeTab === "recruiters" ? recruiterFeatures : applicantFeatures;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display">
      <HeroSection />
      <StatsSection />

      <FeatureTabs activeTab={activeTab} onChange={setActiveTab} />
      <FeatureGrid features={features} />
      <CandidateTeaserCard />

      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
};
