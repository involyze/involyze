<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import Logo from '$lib/Logo.svelte';
  
  const texts = ['text1', 'text2'];
  let currentIndex = 0;
  let showLogo = false;
  
  function handleAnimation() {
    if (currentIndex === 0) {
      const text2 = document.getElementById('text2');
      text2!.classList.add('visible');
      currentIndex++;
    } else if (currentIndex === 1) {
      const text1 = document.getElementById('text1');
      const text2 = document.getElementById('text2');
      text1!.classList.remove('visible');
      text2!.classList.remove('visible');
      showLogo = true;
    }
  }
  
  setInterval(handleAnimation, 2000);
  </script>
  
  <div class="header">
    <Button style="background-color: #6439ff;" href="/login">Login</Button>
  </div>
  
  <div class="main-content">
    <div class="text-container">
      <div id="text1" class="dynamic background visible">The smart way</div>
      <div id="text2" class="dynamic background">to analyze your invoices</div>
    </div>
    {#if showLogo}
      <div class="logo-container background-blurry">
       <img src="/logo_without_com.png" alt="Involyze" class="logo">
      </div>
    {/if}
  </div>
  
  <style>
  .header {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1.5rem 2rem;
  }
  
  .main-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 2rem;
  }
  
  .text-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
  }
  
  .background-blurry {
    background-color: rgba(255, 255, 255, 0.6);
    padding: 2rem;
    border-radius: 8px;
  }
  
  .background {
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .dynamic {
    font-size: 2.5rem;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.8s ease-in-out;
    text-align: center;
    padding: 0.5rem;
    border-radius: 8px;
  }
  
  .logo-container {
    position: absolute;
    opacity: 0;
    animation: fadeIn 0.8s ease-in-out forwards;
  }
  
  .visible {
    opacity: 1;
  }

  .logo-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    animation: fadeIn 0.8s ease-in-out forwards;
  }

  .logo {
    width: 20vw; /* 10% of the viewport width */
    height: auto; /* Maintain aspect ratio */
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  </style>