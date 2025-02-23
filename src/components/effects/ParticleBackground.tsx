// The sickest particle background you've ever seen 🎯
import React from 'react'
import Particles from "react-tsparticles"
import type { Container, ISourceOptions } from "tsparticles-engine"

export const ParticleBackground = () => {
  const particlesInit = React.useCallback(async (engine: any) => {
    // Dynamically import tsparticles-slim to avoid version conflicts
    const { loadSlim } = await import("tsparticles-slim")
    await loadSlim(engine)
  }, [])

  const options: ISourceOptions = {
    background: {
      color: {
        value: "transparent",
      },
    },
    particles: {
      color: {
        value: "#66FCF1"
      },
      links: {
        color: "#66FCF1",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1
      },
      collisions: {
        enable: true,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce"
        },
        random: false,
        speed: 2,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 80
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 5 }
      }
    },
    detectRetina: true
  }

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={options}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  )
} 