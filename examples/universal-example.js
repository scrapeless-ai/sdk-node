import { Universal } from '@scrapeless-ai/sdk';

const universal = new Universal({ timeout: 60000 });

async function jsRender() {
  const result = await universal.jsRender({
    actor: 'unlocker.webunlocker',
    input: {
      url: 'https://www.scrapeless.com',
      headless: false,
      js_render: true,
      js_instructions: [
        {
          wait: 10000
        },
        {
          wait_for: ['.dynamic-content', 30000]
        },
        {
          click: ['#load-more', 1000]
        },
        {
          fill: ['#search-input', 'search term']
        },
        {
          keyboard: ['press', 'Enter']
        },
        {
          evaluate: 'window.scrollTo(0, document.body.scrollHeight)'
        }
      ],
      block: {
        resources: [
          'stylesheet',
          'image',
          'media',
          'font',
          'script',
          'texttrack',
          'xhr',
          'fetch',
          'eventsource',
          'websocket',
          'manifest',
          'other'
        ]
      }
    }
  });

  console.log('Result:', result);
}

async function webUnlocker() {
  const result = await universal.webUnlocker({
    actor: 'unlocker.webunlocker',
    input: {
      url: 'https://www.nike.com/ca/launch?s=upcoming',
      type: '',
      redirect: false,
      method: 'GET',
      header: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    }
  });

  console.log('Result:', result);
}

async function akamaiWebCookie() {
  const result = await universal.akamaiwebCookie({
    actor: 'unlocker.akamaiweb',
    input: {
      type: 'cookie',
      url: 'https://www.iberia.com/',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    },
    proxy: {
      country: 'US'
    }
  });

  console.log('Result:', result);
}

async function akamaiWebSensor() {
  const result = await universal.akamaiwebSensor({
    actor: 'unlocker.akamaiweb',
    input: {
      abck: '0DF99F296DFB4060D36BB36ED3D54130~-1~YAAQ07khF8hvCq+SAQAA54Wiwgwlmf8ZB5T97F80Saj/q5/FwHj9hAOqCdcV+cKqxRtZZ0UK6+bALBxlnay+3dlZcAWfnN+UmDoKmRO9kn+wGN7Z62Oob3T2o9MWsul10NsFVgNba2pRGhB0IF4fzptFVJBpaekcKsmzcDiquqFbC52KdsSlp21CG42NisM6dOXlx2gVSeqLU2ijNVpMaEZeOA0ItvLauaf/EGXWumZZVwvXGcEOFBXrWV63NA/hp41G0+cisUbClFfHdQAwsGWZyT0xPrus4J3ooZKm5pwVkKKM3kW0+Gu/4xWlEL7N2yGpbYcCUt5pJKRdlIYBF/k33A0dPFbBiwqwJnmeCg/sudUBX0ZuTx2awTc7oEAUVBYJrRsruRhub3iBpGRrnCfe9N/gS21Hc3mTZvo2og2CAMmaVmix5fKJSlQICqNaMLlE9ilg3JqC6k9zePCODtzDwybvA5SX8Y+0Ykf1mwVxDsAeaIQVJiJUVn1JXi9Owt7Qn4+GeJyTv4Ou7gdNrLBGFt0IswnzvEHOsWQiwakEyIJ9K5udFE6qQIjACBRFHNb2feKwSOXpHeXOcrOGO38+bHs+JaY2iN4y1wrJVLq/hlm5vGIfo20NJHNzWsRfmn502DlJorpAR5HfNHbghh0gVJP6tYUvyi6WsMFBMGWfVFgLQs6zyWe9V7U4UnJfH6ImIjSr4PonXqshGNSxMvQUMeg1NQAt6emgVG/0lpsaUvYVwWGQYqTJdJBDsvFjQJWRrfcPvDdwiUNAPJZ0WELf5X7q+eWC7C6lOaMvzME3i00IlwdIzMcRPW1yqrFEMPwN9sTA30aQ7LM05uiYY1aJ+ECi9EOeUgz3fMq5tL8pOuMSWU5dHVuBckGfBOrL6aVMdAtUHfskIMKXVBguag==~-1~||0||~-1',
      bmsz: '3A6B16B3276CFCE254BEFBEE3CFA915F~YAAQ07khF/NuCq+SAQAAoXqiwhkZpSRVMT7qPsbrnuBKL5cMCX6rHqdhOz/KLauSYLXxO/SlnflKmmQp0W0Q8uZ6UNC6SRXYctgtcpSTV32rCgnozZGFlk1/nVGRAjMY1UH+97v7EhDOSynkGPqXmxRF3fNd0pd31Fu+ZddDU/U/8PiMrrDqEjt4aaibL+GGbjn+rXR8cL+XrJn2JzIbZm+ddrvYNX+K2Q8WchPywJyLWx7Owq0uRB4OOzqWKz5TZD3dWlirj09fI1YUlnBRlL/mVnSXCWwekVucauI652lV6wqfs1Iykm4ifZkxuuUc9IcaLTpby6clHTZ0UH50eN9WMyiRfT5SNnkqZkVjVg08oYYRXAUdnNWPHqj849yTQdnH1KynNRM5B0U45ApGMnLRUOixTsXAFHU=~3682628~3160113',
      url: 'https://www.scrapeless.com/',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    }
  });
  console.log('Result:', result);
}

async function main() {
  // Uncomment the function you want to run
  await jsRender();
  await webUnlocker();
  await akamaiWebCookie();
  await akamaiWebSensor();
}
