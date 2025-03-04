import { Github, Instagram, Linkedin, Mail, X } from "lucide-react";
import { Link } from "react-router-dom";


const Footer = () => {
    return (
        <footer className="flex flex-col bg-black text-white">
  {/* Footer Top Section */}
  <div className="flex flex-col lg:flex-row gap-10 justify-around items-center py-6 border-t border-pink-900/50 md:px-10 px-4">
    {/* Left Section - Logo & Description */}
    <div className="text-center lg:text-left">
      <Link to={"/"} className="flex items-center justify-center gap-3">
        <img src="logo.png" alt="QuizLabs" className="md:h-20 h-16" />
      </Link>
      <p className="text-gray-300 mt-2 max-w-xs">
        Transform YouTube videos into interactive quizzes and insightful summaries.
      </p>
      {/* Social Icons */}
      <div className="flex flex-row gap-3 mt-3 items-center justify-center lg:justify-start">
        <Link to={"https://github.com/Vermasaiyam"} target="_blank" title="Github" 
          className="bg-black border border-pink-500/50 p-2 rounded-full hover:bg-pink-500 transition duration-300">
          <Github className="w-5 h-5 text-pink-300 hover:text-white" />
        </Link>
        <Link to={"https://www.linkedin.com/in/saiyam05/"} target="_blank" title="LinkedIn"
          className="bg-black border border-pink-500/50 p-2 rounded-full hover:bg-pink-500 transition duration-300">
          <Linkedin className="w-5 h-5 text-pink-300 hover:text-white" />
        </Link>
        <Link to={"https://x.com/SaiyamVerm91813/"} target="_blank" title="X"
          className="bg-black border border-pink-500/50 p-2 rounded-full hover:bg-pink-500 transition duration-300">
          <X className="w-5 h-5 text-pink-300 hover:text-white" />
        </Link>
        <Link to={"https://www.instagram.com/s.verma0504/"} target="_blank" title="Instagram"
          className="bg-black border border-pink-500/50 p-2 rounded-full hover:bg-pink-500 transition duration-300">
          <Instagram className="w-5 h-5 text-pink-300 hover:text-white" />
        </Link>
        <Link to={"mailto:vermasaiyam9@gmail.com"} target="_blank" title="E-mail"
          className="bg-black border border-pink-500/50 p-2 rounded-full hover:bg-pink-500 transition duration-300">
          <Mail className="w-5 h-5 text-pink-300 hover:text-white" />
        </Link>
      </div>
    </div>

    {/* Footer Links */}
    <div className="flex flex-row md:gap-16 gap-6">
      <div className="flex flex-col">
        <h1 className="font-bold text-lg text-pink-400">Support</h1>
        <div className="flex flex-col gap-1 text-gray-300 text-sm">
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">Account</div>
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">Support Center</div>
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">Feedback</div>
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="font-bold text-lg text-pink-400">Useful Links</h1>
        <div className="flex flex-col gap-1 text-gray-300 text-sm">
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">Payment & Tax</div>
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">Terms of Service</div>
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">Privacy Policy</div>
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">About Us</div>
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="font-bold text-lg text-pink-400">Get In Touch</h1>
        <div className="flex flex-col gap-1 text-gray-300 text-sm">
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">
            vermasaiyam9@gmail.com
          </div>
          <div className="hover:text-pink-300 transition duration-200 cursor-pointer">QuizLab</div>
        </div>
      </div>
    </div>
  </div>

  {/* Copyright Section */}
  <div className="bg-black text-center text-gray-400 py-4 px-4 border-t border-pink-900/50">
    <p className="text-sm">
      &copy; 2025 <span className="text-pink-500 font-bold">QuizLab</span>. All rights reserved.
    </p>
  </div>
</footer>

    );
};

export default Footer;