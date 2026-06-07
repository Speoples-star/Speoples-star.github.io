/**
 * @author Stefan Peoples
 * @date 2025-05-10
 * @description This provider handles the theme management for the application, allowing users to switch between different themes.
 */

import React, {createContext, useContext, useEffect, useState} from 'react'
import {useUtils} from "/src/hooks/utils.js"
import ActivitySpinner from "/src/components/loaders/ActivitySpinner.jsx"

function ThemeProvider({ children, supportedThemes, defaultThemeId, showSpinnerOnThemeChange, onThemeChanged }) {
    const utils = useUtils()

    const allThemes = Array.isArray(supportedThemes) && supportedThemes.length > 0 ?
        supportedThemes :
        []

    const defaultTheme = allThemes.find(theme => theme.id === defaultThemeId)
        || allThemes[0]

    const supportsMultipleThemes = allThemes.length >= 2

    const [spinnerActivities, setSpinnerActivities] = useState([])
    const [selectedThemeId, setSelectedThemeId] = useState(null)
    const [themePreferenceSource, setThemePreferenceSource] = useState(null)

    const getThemeById = (themeId) => {
        if(!themeId)
            return null

        return allThemes.find(theme => theme.id === themeId) || null
    }

    const getSystemTheme = () => {
        if(typeof window === "undefined" || typeof window.matchMedia !== "function")
            return null

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")?.matches
        const systemThemeId = prefersDark ? "dark" : "light"
        return getThemeById(systemThemeId)
    }

    const applyTheme = (theme, persist = true, source = persist ? "saved" : "system") => {
        if(!theme)
            return

        const shouldAnimate = persist && showSpinnerOnThemeChange && selectedThemeId && selectedThemeId !== theme.id

        const _apply = () => {
            document.documentElement.setAttribute('data-theme', theme.id)
            onThemeChanged(theme.id)
        }

        setSelectedThemeId(theme.id)
        setThemePreferenceSource(source)

        if(persist)
            utils.storage.setPreferredTheme(theme.id)

        if(!shouldAnimate) {
            _apply()
            return
        }

        setSpinnerActivities([{id: "theme-change"}])
        setTimeout(() => { _apply() }, 30)
        setTimeout(() => { setSpinnerActivities([]) }, 300)
    }

    /** @constructs **/
    useEffect(() => {
        if(allThemes.length === 0) {
            utils.log.throwError("ThemeProvider", "The app must support at least one theme. Make sure you filled the supportedThemes property in the settings.json file.")
            return
        }

        const savedThemeId = utils.storage.getPreferredTheme()
        const savedTheme = getThemeById(savedThemeId)
        if(savedTheme) {
            applyTheme(savedTheme, true, "saved")
            return
        }

        const systemTheme = getSystemTheme()
        if(systemTheme) {
            applyTheme(systemTheme, false, "system")
            return
        }

        applyTheme(defaultTheme, false, "default")
    }, [])

    useEffect(() => {
        if(themePreferenceSource === "saved")
            return

        if(typeof window === "undefined" || typeof window.matchMedia !== "function")
            return

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

        const handleChange = (event) => {
            if(themePreferenceSource === "saved")
                return

            const nextTheme = getThemeById(event.matches ? "dark" : "light") || defaultTheme
            applyTheme(nextTheme, false, "system")
        }

        if(mediaQuery.addEventListener)
            mediaQuery.addEventListener("change", handleChange)
        else if(mediaQuery.addListener)
            mediaQuery.addListener(handleChange)

        return () => {
            if(mediaQuery.removeEventListener)
                mediaQuery.removeEventListener("change", handleChange)
            else if(mediaQuery.removeListener)
                mediaQuery.removeListener(handleChange)
        }
    }, [themePreferenceSource, selectedThemeId, allThemes])

    const getSelectedTheme = () => {
        return getThemeById(selectedThemeId)
    }

    const setSelectedTheme = (theme) => {
        applyTheme(theme, true, "saved")
    }

    const getAvailableThemes = (excludeSelected) => {
        if(!allThemes)
            return []

        if(!excludeSelected)
            return allThemes
        return allThemes.filter(theme => theme.id !== selectedThemeId)
    }

    const toggle = () => {
        const selectedTheme = getSelectedTheme()
        const currentIndex = allThemes.indexOf(selectedTheme)
        const targetIndex = currentIndex + 1

        const targetTheme = targetIndex >= allThemes.length ?
            allThemes[0] :
            allThemes[targetIndex]

        setSelectedTheme(targetTheme)
    }

    return (
        <ThemeContext.Provider value={{
            setSelectedTheme,
            getSelectedTheme,
            supportsMultipleThemes,
            getAvailableThemes,
            toggle
        }}>
            <ActivitySpinner activities={spinnerActivities}
                             defaultMessage={null}/>

            {selectedThemeId && (
                <>{children}</>
            )}
        </ThemeContext.Provider>
    )
}

const ThemeContext = createContext(null)
/**
 * @return {{
 *   setSelectedTheme: Function,
 *   getSelectedTheme: Function,
 *   supportsMultipleThemes: Boolean,
 *   getAvailableThemes: Function,
 *   toggle: Function
 * }}
 */
export const useTheme = () => useContext(ThemeContext)

export default ThemeProvider
