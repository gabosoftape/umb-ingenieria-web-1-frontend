import React from 'react'
import BrandLogo from './brand-logo'

type IconProps = React.HTMLAttributes<SVGElement>
const BespokeLogoLegacy = (props: IconProps) => {
    // Usar el BrandLogo para mantener la compatibilidad con código existente
    return <BrandLogo {...props} />
}

export default BespokeLogoLegacy