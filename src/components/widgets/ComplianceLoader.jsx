import "./ComplianceLoader.scss"
import React from 'react'

function ComplianceLoader({ className = "", color = "security-loader-color-variant-loader", hidden = false }) {
    const hiddenClass = hidden ? `security-loader-wrapper-hidden` : ``

    return (
        <div className={`security-loader-wrapper ${className} ${hiddenClass}`}>
            <div className={`security-loader ${color}`}>
                <div className="security-loader-shield">
                    <div className="security-loader-shield-inner" />
                    <div className="security-loader-shield-check">
                        <span />
                    </div>
                </div>
                <div className="security-loader-scan">
                    <span />
                </div>
            </div>
        </div>
    )
}

ComplianceLoader.ColorVariants = {
    LOADER: "security-loader-color-variant-loader"
}

export default ComplianceLoader
