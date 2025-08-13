import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 요청 본문이 있는지 먼저 확인
    const body = await req.text();
    console.log('Received body:', body); // 디버깅용
    
    if (!body) {
      throw new Error('요청 본문이 비어있습니다.');
    }
    
    const { address } = JSON.parse(body);
    
    if (!address) {
      throw new Error('주소가 제공되지 않았습니다.')
    }

    // Deno의 환경 변수에서 Naver API 키를 안전하게 가져옵니다.
    const apiKeyId = Deno.env.get('NAVER_API_KEY_ID')
    const apiKey = Deno.env.get('NAVER_API_KEY')

    if (!apiKeyId || !apiKey) {
      throw new Error('API 키가 서버에 설정되지 않았습니다.')
    }

    const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`
    
    const response = await fetch(url, {
          method: 'GET',
          headers: {
            // 'w'가 빠져있던 헤더 이름 오타 수정
            'X-NCP-APIGW-API-KEY-ID': apiKeyId,
            'X-NCP-APIGW-API-KEY': apiKey,
            'Accept': 'application/json'
          }
        })

    if (!response.ok) {
      throw new Error(`Naver API 오류: ${response.statusText}`)
    }

    const data = await response.json();
    
    // Naver API 응답에서 좌표 추출
    if (data.status === 'OK' && data.addresses && data.addresses.length > 0) {
      const coords = {
        latitude: parseFloat(data.addresses[0].y),
        longitude: parseFloat(data.addresses[0].x)
      };
      
      return new Response(JSON.stringify(coords), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      throw new Error('해당 주소에 대한 좌표를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('Error:', error); // 디버깅용
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
