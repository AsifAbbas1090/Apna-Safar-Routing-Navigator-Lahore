"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Information We Collect",
      content: [
        "Location data: We collect your current location and destination to provide route planning services.",
        "Usage data: We track your route searches and preferences to improve our service.",
        "Account information: If you create an account, we collect your email address and basic profile information.",
        "Cookies: We use cookies to enhance your experience and remember your preferences.",
      ],
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "How We Use Your Information",
      content: [
        "To provide route planning and navigation services.",
        "To improve our AI-powered routing algorithms.",
        "To send you important updates about the service (if you have an account).",
        "To analyze usage patterns and improve our service.",
      ],
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Data Security",
      content: [
        "We use industry-standard encryption to protect your data.",
        "Your location data is only used for route planning and is not shared with third parties.",
        "We do not sell your personal information to advertisers or other companies.",
        "You can use our service without creating an account, ensuring minimal data collection.",
      ],
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Your Rights",
      content: [
        "You can access and update your account information at any time.",
        "You can delete your account and all associated data.",
        "You can use the service without logging in to minimize data collection.",
        "You can contact us at synkspace.io@gmail.com for any privacy concerns.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Supported by <a href="https://synkspace.io" target="_blank" rel="noopener noreferrer" className="text-[#9AB973] hover:underline font-bold">SynkSpace</a>
            </p>
          </div>

          <div className="mb-8 rounded-lg border-2 border-[#556B2F] bg-gradient-to-br from-black to-[#1a1a1a] p-6">
            <p className="text-lg text-gray-300">
              At Apna Safar, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our public transport navigation service.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-2 border-[#556B2F] bg-gradient-to-br from-black to-[#1a1a1a] text-white">
                  <CardHeader>
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#556B2F] text-[#9AB973]">
                        {section.icon}
                      </div>
                      <CardTitle className="text-2xl text-white">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-3 text-gray-300">
                          <span className="mt-1 text-[#9AB973]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 rounded-lg border-2 border-[#556B2F] bg-gradient-to-br from-black to-[#1a1a1a] p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Contact Us</h2>
            <p className="mb-4 text-gray-300">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>Email: <a href="mailto:synkspace.io@gmail.com" className="text-[#9AB973] hover:underline">synkspace.io@gmail.com</a></li>
              <li>Phone: <a href="https://wa.me/923143796943" target="_blank" rel="noopener noreferrer" className="text-[#9AB973] hover:underline">+92 314 3796943</a></li>
              <li>Website: <a href="https://synkspace.io" target="_blank" rel="noopener noreferrer" className="text-[#9AB973] hover:underline">synkspace.io</a></li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <Link href="/">
              <button className="rounded-lg bg-[#556B2F] px-6 py-3 text-white hover:bg-[#6B7F3F] transition-colors">
                Back to Home
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

