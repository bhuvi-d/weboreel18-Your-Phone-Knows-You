import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { createIcons, Volume2, VolumeX, Smartphone, Eye, Zap, Brain } from 'lucide'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// Initialize Icons
createIcons({
  icons: { Volume2, VolumeX, Smartphone, Eye, Zap, Brain }
})

// --- Mouse Follower ---
const scanner = document.querySelector('.scanner-focus')
window.addEventListener('mousemove', (e) => {
  gsap.to(scanner, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.2,
    ease: 'power2.out'
  })
})

document.addEventListener('mouseover', (e) => {
  if (e.target.closest('.question-card, .log-entry, .res-card')) {
    scanner.style.opacity = '1'
  } else {
    scanner.style.opacity = '0'
  }
})

// --- Advanced Audio Engine ---
class AudioEngine {
  constructor() {
    this.ctx = null
    this.isMuted = true
    this.musicStarted = false
    this.gainNode = null
    this.filter = null
  }

  init() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.gainNode = this.ctx.createGain()
    this.gainNode.connect(this.ctx.destination)
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime)
    
    this.filter = this.ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.setValueAtTime(1200, this.ctx.currentTime)
    this.filter.connect(this.gainNode)
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    const targetVal = this.isMuted ? 0 : 0.4
    this.gainNode.gain.exponentialRampToValueAtTime(targetVal + 0.001, this.ctx.currentTime + 0.5)
    
    if (!this.isMuted && !this.musicStarted) {
      this.startLoFi()
      this.musicStarted = true
    }
    return this.isMuted
  }

  startLoFi() {
    const playSynth = (freq, time, dur, vol, type = 'sine') => {
      const osc = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, time)
      g.gain.setValueAtTime(vol, time)
      g.gain.exponentialRampToValueAtTime(0.001, time + dur)
      osc.connect(g)
      g.connect(this.filter)
      osc.start(time)
      osc.stop(time + dur)
    }

    const playPerc = (time) => {
      const noise = this.ctx.createBufferSource()
      const bufferSize = this.ctx.sampleRate * 0.05
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
      noise.buffer = buffer
      
      const g = this.ctx.createGain()
      g.gain.setValueAtTime(0.02, time)
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
      
      noise.connect(g)
      g.connect(this.gainNode)
      noise.start(time)
    }

    const loop = () => {
      if (this.isMuted) return
      const now = this.ctx.currentTime
      const tempo = 0.5
      
      for (let i = 0; i < 16; i++) {
        const time = now + i * tempo
        // Melodic layer
        if (i % 4 === 0) playSynth(110, time, 1.5, 0.05)
        if (i % 8 === 2) playSynth(220, time, 0.5, 0.02, 'triangle')
        
        // Percussion layer
        if (i % 2 === 0) playPerc(time)
        
        // Random glitch pops
        if (Math.random() > 0.8) playSynth(Math.random() * 2000 + 500, time + 0.25, 0.02, 0.01, 'square')
      }
      this.loopTimeout = setTimeout(loop, 16 * tempo * 1000)
    }
    loop()
  }

  playGlitch() {
    if (!this.ctx || this.isMuted) return
    const now = this.ctx.currentTime
    for (let i = 0; i < 10; i++) {
      const time = now + i * 0.05
      const osc = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      osc.type = Math.random() > 0.5 ? 'square' : 'sawtooth'
      osc.frequency.setValueAtTime(Math.random() * 1000 + 100, time)
      g.gain.setValueAtTime(0.02, time)
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
      osc.connect(g)
      g.connect(this.gainNode)
      osc.start(time)
      osc.stop(time + 0.05)
    }
  }

  playPing() {
    if (!this.ctx || this.isMuted) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.1)
    g.gain.setValueAtTime(0.05, this.ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2)
    osc.connect(g)
    g.connect(this.gainNode)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.2)
  }

  playTap() {
    if (!this.ctx || this.isMuted) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(220, this.ctx.currentTime)
    g.gain.setValueAtTime(0.02, this.ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05)
    osc.connect(g)
    g.connect(this.gainNode)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.05)
  }
}

const audio = new AudioEngine()

// --- Visual Glitch Trigger ---
function triggerVisualGlitch() {
  document.body.classList.add('glitch-active')
  setTimeout(() => document.body.classList.remove('glitch-active'), 300)
}

// --- UI Logic ---
const soundToggle = document.getElementById('sound-toggle')
const soundIcon = document.getElementById('sound-icon')

soundToggle.addEventListener('click', () => {
  audio.init()
  const muted = audio.toggleMute()
  soundIcon.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2')
  soundToggle.querySelector('span').innerText = muted ? 'Sound Off' : 'Sound On'
  createIcons({ icons: { Volume2, VolumeX } })
  if (!muted) audio.playPing()
})

// --- Fake Logs ---
const logData = [
  'analyzing screen unlock patterns...',
  'tracking idle scrolling behavior...',
  'measuring attention shifts...',
  'detecting unconscious usage...',
  'correlating session frequency...',
  'mapping digital attention spans...'
]

const logContainer = document.getElementById('log-container')
logData.forEach((text) => {
  const div = document.createElement('div')
  div.className = 'log-entry'
  div.innerHTML = `<p class="log-msg">${text}</p>`
  logContainer.appendChild(div)

  gsap.to(div, {
    scrollTrigger: {
      trigger: div,
      start: 'top 85%',
      onEnter: () => {
        div.classList.add('visible')
        audio.playTap()
      }
    }
  })
})

// --- Questions ---
const questionCards = document.querySelectorAll('.question-card')
let currentQ = 0

document.querySelectorAll('.opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    audio.playTap()
    const card = btn.closest('.question-card')
    card.classList.add('prev')
    
    currentQ++
    if (currentQ < questionCards.length) {
      questionCards[currentQ].classList.remove('inactive')
    } else {
      gsap.to(window, { scrollTo: '#analysis', duration: 1.5, ease: 'power2.inOut' })
      startAnalysis()
    }
  })
})

// --- Analysis Build ---
function startAnalysis() {
  const percent = document.getElementById('percent')
  const circle = document.getElementById('progress-circle')
  const stepText = document.getElementById('analysis-step')
  let count = 0
  
  const steps = [
    'Mapping attention loops...',
    'Identifying behavioral patterns...',
    'Building your digital mirror...',
    'Refining insights...'
  ]

  const interval = setInterval(() => {
    count++
    percent.innerText = `${count}%`
    
    // Circle progress (stroke-dashoffset: 283 is empty, 0 is full)
    const offset = 283 - (count / 100) * 283
    circle.style.strokeDashoffset = offset

    if (count % 25 === 0) {
      stepText.innerText = steps[Math.floor(count / 25) - 1] || 'Almost there...'
      audio.playPing()
    }

    if (count >= 100) {
      clearInterval(interval)
      audio.playGlitch()
      triggerVisualGlitch()
      setTimeout(() => {
        gsap.to(window, { scrollTo: '#results', duration: 2, ease: 'power3.inOut' })
        revealResults()
      }, 500)
    }
  }, 40)
}

// --- Results ---
const insights = [
  "You check your phone more out of habit than intention.",
  "You scroll to avoid stillness, searching for a spark of novelty.",
  "You open apps without purpose, a reflex of the digital age.",
  "You are aware of the pattern… but not yet interrupting it."
]

function revealResults() {
  const grid = document.getElementById('results-grid')
  insights.forEach((text, i) => {
    const card = document.createElement('div')
    card.className = 'res-card holographic'
    card.innerHTML = `
      <div class="tech-corners"></div>
      <span class="meta" style="margin-bottom: 1rem; display: block;">METADATA // SRC_0${i+1}</span>
      <p>${text}</p>
    `
    grid.appendChild(card)
    
    setTimeout(() => {
      card.classList.add('visible')
      audio.playPing()
    }, i * 800)
  })
}

// --- Smooth Scrolls ---
gsap.to('.scroll-progress', {
  width: '100%',
  ease: 'none',
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true
  }
})

// Hero Fades
gsap.utils.toArray('.fade-in').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0,
    y: 20,
    duration: 1.2,
    delay: i * 0.3,
    ease: 'power2.out'
  })
})

// Final Buttons
document.getElementById('run-again').addEventListener('click', () => {
  location.reload()
})

document.getElementById('share-btn').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: 'Your Phone Knows You',
      text: "I just took a digital self-awareness test. The results were... insightful. Check yours.",
      url: window.location.href
    })
  } else {
    alert("Copied to clipboard!")
  }
})
