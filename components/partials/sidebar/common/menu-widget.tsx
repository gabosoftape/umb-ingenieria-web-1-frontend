'use client'
import { Button } from '@/components/ui/button'
import { useConfig } from '@/hooks/use-config'
import Image from 'next/image'
import React from 'react'

const MenuWidget = () => {
    const [config] = useConfig();
    const clickContact = () => {
        window.open('https://knot.com.co', '_blank');
    }
    if (config.sidebar === 'compact') return null
    return (
        <div className="dark">
            <div className="bg-default-50 mb-16 mt-24 p-4 relative text-center rounded-2xl  text-white">

                <Image className="mx-auto relative -mt-[73px]" alt="" src="/images/icon/dark.png" priority width={99} height={114} />
                <div className="max-w-[160px] mx-auto mt-6">
                    <div className="">Knot Developers</div>
                    <div className="text-xs font-light">
                        knot.com.co
                    </div>
                </div>
                <div className="mt-6">
                    <Button size="sm" fullWidth className=' bg-white text-default-50 hover:bg-background/90' onClick={clickContact}>
                        Contacto
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MenuWidget