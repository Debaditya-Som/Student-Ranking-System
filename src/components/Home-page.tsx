"use client"

import { useState } from "react";
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  FileSpreadsheet,
  Settings,
  Clock
} from "lucide-react";

const handleNavigation = () => {
    window.location.href = '/Ranking';
  };

export default function HomePage() {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      title: "Smart Subject Management",
      description: "Customize your curriculum with flexible subject management"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
      title: "Real-time Analytics",
      description: "Get instant insights into student performance trends"
    },
    {
      icon: <Award className="h-6 w-6 text-blue-500" />,
      title: "Advanced Ranking System",
      description: "Automated ranking with customizable criteria"
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6 text-blue-500" />,
      title: "PDF Reports",
      description: "Generate comprehensive performance reports instantly"
    },
    {
      icon: <Settings className="h-6 w-6 text-blue-500" />,
      title: "Flexible Configuration",
      description: "Adapt the system to your institution's needs"
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      title: "Time-Saving Tools",
      description: "Streamline your assessment workflow efficiently"
    }
  ];

  const benefits = [
    {
      title: "Easy Implementation",
      description: "Get started in minutes with our intuitive interface"
    },
    {
      title: "Accurate Results",
      description: "Precise calculations for fair student assessment"
    },
    {
      title: "Time Efficiency",
      description: "Save hours on manual ranking calculations"
    },
    {
      title: "Flexible System",
      description: "Adaptable to various educational frameworks"
    }
  ];

  return (
    <div className="text-black min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                Student Ranking System
              </span>
            </div>
            <div className="flex gap-6 items-center">
              <button className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </button>
              <button className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </button>
              <button className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </button>
              <button  onClick={handleNavigation}
          
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Transform Your 
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                  {" "}Student Assessment{" "}
                </span>
                Process
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline your academic evaluation with our intelligent ranking system. Save time, ensure accuracy, and focus on what matters most - your students.
              </p>
              <div className="flex gap-4">
                <button  onClick={handleNavigation}
                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  Start Ranking <ArrowRight className="h-5 w-5" />
                </button>
                <button  onClick={handleNavigation}
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2.5 w-3/4 bg-gray-200 rounded-full mb-2"></div>
                        <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage student rankings effectively and efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-200 transition-all hover:shadow-lg">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Designed to make your assessment process smoother and more efficient
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-blue-100">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          
          <button  onClick={handleNavigation}
                 className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">
            Start Using Student Ranking System
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-auto">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6" />
                <span className="text-lg font-bold">Student Ranking System</span>
              </div>
              <p className="text-gray-400">
                Transforming student assessment with intelligent ranking solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
                <li>Updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()}    Debaditya Som . All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}