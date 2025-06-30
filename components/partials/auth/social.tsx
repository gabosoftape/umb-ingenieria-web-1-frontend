"use client";

import GoogleButton from "./google-button";

interface SocialProps {
  locale: string;
  mode: 'login' | 'register';
}

const Social = ({ locale, mode }: SocialProps) => {
  return (
    <>
      <ul className="flex justify-center">
        <li className="flex-1 max-w-[60px]">
          <GoogleButton locale={locale} mode={mode} />
        </li>
      </ul>
    </>
  );
};

export default Social;
