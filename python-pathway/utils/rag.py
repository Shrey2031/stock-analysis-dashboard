import os
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
llm = OpenAI(temperature=0.3, openai_api_key=os.getenv('OPENAI_API_KEY'))  # Low temp for factual

def generate_rag_insight(data, symbol):
    """
    Generate AI insight using RAG-like prompt (embed data context).
    - data: DataFrame
    - Returns: String insight (e.g., "Bullish trend with RSI neutral")
    """
    if data.empty or os.getenv('OPENAI_API_KEY') is None:
        # Fallback without OpenAI
        recent_close = data['Close'].iloc[-1] if not data.empty else 0
        trend = 'bullish' if len(data) > 5 and data['Close'].iloc[-5:].mean() < recent_close else 'bearish'
        return f"{symbol}: {trend.capitalize()} trend detected based on recent prices."

    try:
        # Extract context from data
        recent_close = data['Close'].iloc[-1]
        change_pct = ((recent_close - data['Close'].iloc[-2]) / data['Close'].iloc[-2] * 100) if len(data) > 1 else 0
        trend = 'bullish' if change_pct > 0 else 'bearish'
        volume_avg = data['Volume'].tail(5).mean()
        latest_volume = data['Volume'].iloc[-1]
        volume_signal = 'high volume' if latest_volume > volume_avg * 1.5 else 'normal volume'

        # Prompt template (RAG: Retrieve data, Augment prompt, Generate)
        prompt = PromptTemplate(
            input_variables=["symbol", "recent_price", "change_pct", "trend", "volume_signal"],
            template="""
            You are a financial analyst. Provide a short, insightful analysis for {symbol}.
            Recent price: ${recent_price:.2f}, 24h change: {change_pct:.1f}%, trend: {trend}.
            Volume: {volume_signal}.
            Keep it under 50 words, focus on buy/sell signals or risks.
            """
        )
        
        chain = LLMChain(llm=llm, prompt=prompt)
        insight = chain.run(
            symbol=symbol,
            recent_price=recent_close,
            change_pct=change_pct,
            trend=trend,
            volume_signal=volume_signal
        )
        return insight.strip()
    except Exception as e:
        print(f"RAG error for {symbol}: {e}")
        return f"Analysis for {symbol}: Unable to generate insight (check API key)."