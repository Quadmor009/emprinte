'use client';

import { AnimateOnView } from '@/components/motion/AnimateOnView';

export function Initiatives() {
  return (
    <section
      id="bootcamps"
      className="w-full bg-[#F0FFFD] px-6 py-8 xl:pt-[133px] lg:pt-[90px] md:pt-[80px] pt-[60px] lg:px-[75px] xl:px-[120px] flex flex-col gap-7"
    >
      <AnimateOnView className="w-full flex flex-col  md:flex-row justify-between md:items-center  max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-4  md:max-w-[500px]">
          <div className="flex h-6 px-4 justify-center items-center gap-2.5 rounded-3xl bg-[#E63715] w-fit">
            <span className="text-[10px] md:text-[14px] leading-[150%] font-normal text-white font-poppins">
              Virtual Bootcamps
            </span>
          </div>

          <div className="text-[32px] lg:text-[45px] xl:text-[64px] leading-[40px] lg:leading-[50px] xl:leading-[64px] font-bold text-[#005D51] font-lora flex flex-col">
            Take Action,
            <span>Make Progress.</span>
          </div>
        </div>
        <p className="text-[#7B7B7B] font-medium font-poppins mt-4 max-w-[328px] md:hidden">
          Our bootcamps push you to live what you learn. Join a group of
          motivated readers, commit to daily tasks, and holding each other
          accountable.
        </p>

        <p className="text-base lg:text-xl xl:text-2xl leading-[24px] lg:leading-[28px] xl:leading-[32px] font-medium text-[#7B7B7B] font-poppins md:max-w-[350px] lg:max-w-[400px] xl:max-w-[574px]">
          Our bootcamps push you to live what you learn. Join a group of
          motivated readers, commit to growth and productivity.
        </p>
        {/* <div className="w-full lg:max-w-[478px] md:max-w-[378px]  mt-8">
          <div className="rounded-2xl bg-[#CAE594] xl:p-6 p-4 flex flex-col lg:gap-6 gap-4">

            <div className="flex flex-col items-start gap-0">
              <h3 className="text-[28px] leading-snug md:leading-normal lg:text-4xl xl:text-[40px] font-bold text-black font-poppins">
                5AM Club Bootcamp
              </h3>

              <p className="text-xs md:text-sm lg:text-2xl font-normal text-black font-poppins ">
                Own your morning, elevate your life.
              </p>
            </div>

            <div className="flex flex-wrap items-center lg:gap-3 gap-2">
              <div className="lg:px-4 px-3 py-2 md:h-8 h-6 rounded-lg bg-[#E63715] flex items-center justify-center">
                <span className="text-xs md:text-sm lg:text-base font-normal text-white font-lora">
                  Cohort IV
                </span>
              </div>

              <div className="lg:px-4 px-3 md:h-8 h-6 rounded-lg bg-white border border-[#CAE594] flex items-center gap-2 ">
                <CalendarIcon />
                <span className="text-xs md:text-sm lg:text-base font-normal text-black font-poppins">
                  30 Days
                </span>
              </div>

              <div className="lg:px-4 px-3 md:h-8 h-6 rounded-lg bg-white border border-[#CAE594] flex items-center gap-2">
                <CommunityIcon />
                <span className="text-xs md:text-sm lg:text-base font-normal text-black font-poppins">
                  Community
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                window.open(
                  'https://docs.google.com/forms/d/e/1FAIpQLSeEU3BES6YJ7Rvk3L3k-r9CnkKtaHaRzVYJG4fDtC66D5R75A/viewform',
                  '_blank'
                )
              }
              className="w-full md:w-auto px-6 h-10 lg:h-12 rounded-lg bg-white text-black font-normal text-base lg:text-lg font-poppins hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Click here to Join
            </button>
          </div>
        </div> */}
      </AnimateOnView>

      {/* 5AM Club Bootcamp Card */}
    </section>
  );
}
