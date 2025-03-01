import { useEffect, useState } from "react";
import TextCarousel from "./TextCrousel";
import FloatingCarousel from "./Carousel";
import InputPage from "./InputPage";

export default function Home() {
    return (
        <>
            <div className="bg-gradient-to-b from-[#8E0651] to-black min-h-[90vh] flex flex-col items-center justify-center text-white p-4">
                <div className="flex flex-col items-center justify-center text-white">
                    <TextCarousel />
                </div>

                <div>
                    <button type="button" className="text-white bg-[#D90452] hover:bg-[#B00346] focus:ring-4 focus:outline-none focus:ring-[#B00346] font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center shadow-md" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                        Get Started
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </button>
                </div>

                <FloatingCarousel />

            </div>
            <div>

                <InputPage />
            </div>
        </>
    );
}