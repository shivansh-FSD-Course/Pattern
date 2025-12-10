import sys
import json
import pandas as pd
import numpy as np
from scipy.signal import find_peaks
from scipy.optimize import curve_fit
from scipy.fft import fft, fftfreq
import random

# MAIN LOGIC


def analyze_bitcoin_patterns(csv_path):
    try:
        df = pd.read_csv(csv_path)

        required_cols = ['Open time', 'Close']
        if not all(col in df.columns for col in required_cols):
            return {'error': 'Invalid CSV format. Missing required columns.'}

        # Pattern detection
        patterns = {
            'fibonacci_retracements': detect_fibonacci_retracements(df),
            'exponential_growth': detect_exponential_growth(df),
            'market_cycles': detect_market_cycles(df),
            'golden_ratios': detect_golden_ratios(df),
            'statistics': calculate_statistics(df)
        }

        # Visualization 
        viz_data = generate_visualization_data(df, patterns)

        # Insights
        insights = generate_insights(patterns)

        return {
            'success': True,
            'dataset_type': 'bitcoin',
            'patterns': patterns,
            'visualization_data': viz_data,
            'insights': insights
        }

    except Exception as e:
        return {'error': str(e)}

# PATTERN DETECTORS


def detect_fibonacci_retracements(df):
    prices = df['Close'].values
    dates = pd.to_datetime(df['Open time'])

    peaks_idx, _ = find_peaks(prices, distance=30, prominence=1000)
    troughs_idx, _ = find_peaks(-prices, distance=30, prominence=1000)

    if len(peaks_idx) == 0 or len(troughs_idx) == 0:
        return {'error': 'Not enough peaks/troughs found'}

    swing_high_idx = peaks_idx[np.argmax(prices[peaks_idx])]
    swing_low_idx = troughs_idx[np.argmin(prices[troughs_idx])]

    swing_high = float(prices[swing_high_idx])
    swing_low = float(prices[swing_low_idx])
    diff = swing_high - swing_low

    fib_levels = {
        '0.0': float(swing_low),
        '0.236': float(swing_low + diff * 0.236),
        '0.382': float(swing_low + diff * 0.382),
        '0.500': float(swing_low + diff * 0.50),
        '0.618': float(swing_low + diff * 0.618),
        '0.786': float(swing_low + diff * 0.786),
        '1.0': float(swing_high),
        '1.618': float(swing_high + diff * 0.618)
    }

    return {
        'swing_high': swing_high,
        'swing_low': swing_low,
        'swing_high_date': dates.iloc[swing_high_idx].strftime('%Y-%m-%d'),
        'swing_low_date': dates.iloc[swing_low_idx].strftime('%Y-%m-%d'),
        'levels': fib_levels,
        'range_usd': float(diff),
        'pattern_quality': 'strong'
    }


def detect_exponential_growth(df):
    prices = df['Close'].values
    dates = pd.to_datetime(df['Open time'])

    cumulative_max = np.maximum.accumulate(prices)
    drawups = (prices - np.minimum.accumulate(prices)) / np.minimum.accumulate(prices)

    max_idx = np.argmax(drawups)
    start_idx = 0

    for i in range(max_idx - 1, -1, -1):
        if prices[i] < prices[start_idx] * 1.1:
            start_idx = i

    segment_prices = prices[start_idx:max_idx + 1]
    if len(segment_prices) < 10:
        return {'error': 'Bull market segment too short'}

    segment_time = np.arange(len(segment_prices))

    def exp_func(x, a, b):
        return a * np.exp(b * x)

    try:
        params, _ = curve_fit(
            exp_func, segment_time, segment_prices,
            p0=[segment_prices[0], 0.01], maxfev=5000
        )

        predicted = exp_func(segment_time, *params)
        ss_res = np.sum((segment_prices - predicted) ** 2)
        ss_tot = np.sum((segment_prices - np.mean(segment_prices)) ** 2)
        r2 = float(1 - ss_res / ss_tot)

        return {
            'phase': 'bull_market',
            'start_date': dates.iloc[start_idx].strftime('%Y-%m-%d'),
            'end_date': dates.iloc[max_idx].strftime('%Y-%m-%d'),
            'start_price': float(segment_prices[0]),
            'end_price': float(segment_prices[-1]),
            'growth_multiple': float(segment_prices[-1] / segment_prices[0]),
            'growth_rate': float(params[1]),
            'r_squared': r2,
            'duration_days': int(max_idx - start_idx),
            'quality': 'excellent' if r2 > 0.9 else 'good'
        }

    except Exception:
        return {'error': 'Exponential fit failed'}


def detect_market_cycles(df):
    prices = df['Close'].values
    from scipy import signal

    detrended = signal.detrend(prices)
    fft_vals = fft(detrended)
    freqs = fftfreq(len(prices), 1)

    pos_freqs = freqs[:len(prices) // 2]
    fft_mag = np.abs(fft_vals[:len(prices) // 2])
    fft_mag[0] = 0

    idx = np.argmax(fft_mag)
    dom_freq = pos_freqs[idx]

    if dom_freq == 0:
        return {'error': 'No cycles detected'}

    period_days = int(1 / abs(dom_freq))
    cycles = len(prices) // period_days

    return {
        'cycle_period_days': period_days,
        'cycle_period_months': round(period_days / 30, 1),
        'amplitude_usd': float(fft_mag[idx]),
        'num_cycles': cycles,
        'pattern_strength': float(fft_mag[idx]),
        'cycle_quality': 'strong' if cycles >= 2 else 'moderate'
    }


def detect_golden_ratios(df):
    GOLD = 1.618
    TOL = 0.08

    prices = df['Close'].values
    dates = pd.to_datetime(df['Open time'])

    peaks_idx, _ = find_peaks(prices, distance=30, prominence=1000)
    if len(peaks_idx) < 2:
        return {'found_count': 0, 'occurrences': []}

    matches = []
    for i in range(len(peaks_idx) - 1):
        p1 = float(prices[peaks_idx[i]])
        p2 = float(prices[peaks_idx[i + 1]])
        ratio = p2 / p1

        if abs(ratio - GOLD) / GOLD < TOL:
            matches.append({
                'date1': dates.iloc[peaks_idx[i]].strftime('%Y-%m-%d'),
                'date2': dates.iloc[peaks_idx[i + 1]].strftime('%Y-%m-%d'),
                'price1': p1,
                'price2': p2,
                'ratio': ratio
            })

    return {
        'found_count': len(matches),
        'occurrences': matches[:10]
    }


def calculate_statistics(df):
    prices = df['Close'].values
    dates = pd.to_datetime(df['Open time'])

    return {
        'total_days': len(prices),
        'date_range_start': dates.iloc[0].strftime('%Y-%m-%d'),
        'date_range_end': dates.iloc[-1].strftime('%Y-%m-%d'),
        'price_min': float(prices.min()),
        'price_max': float(prices.max()),
        'price_mean': float(prices.mean()),
        'price_std': float(prices.std()),
        'total_growth': float((prices[-1] / prices[0] - 1) * 100),
        'volatility': float(prices.std() / prices.mean() * 100)
    }

# FIBONACCI RINGS


def build_fibonacci_rings(prices, patterns):
    fib = patterns.get("fibonacci_retracements", {})
    if "levels" not in fib:
        return []

    pmin, pmax = prices.min(), prices.max()

    rings = []
    for level_name, price in fib["levels"].items():
        y = (price - pmin) / (pmax - pmin + 1e-9) * 60

        rings.append({
            "level": level_name,
            "price": float(price),
            "y": float(y),
            "color": "#88ccee" if level_name in ["0.618", "1.618"] else "#445577",
            "is_golden": level_name in ["0.618", "1.618"]
        })

    return rings



#  3D SPIRAL GENERATOR


def generate_visualization_data(df, patterns):
    prices = df["Close"].values.astype(float)
    dates = pd.to_datetime(df["Open time"])

    # Normalize
    pmin = float(np.nanmin(prices))
    pmax = float(np.nanmax(prices))
    scale = (prices - pmin) / (pmax - pmin + 1e-9)

    # --- Pick a visualization type ----
    viz_type = random.choice(["data_ribbon", "golden_spiral", "candle_spiral"])
    # viz_type = "golden_spiral"   # <- uncomment to force a specific one

    
    #  VERTICAL COLUMN 
   
    def build_vertical_column():
        pts = []
        for i, p in enumerate(scale):
            pts.append({
                "x": 0.0,
                "y": float(p * 100),
                "z": 0.0,
                "price": float(prices[i]),
                "index": i,
                "date": dates.iloc[i].strftime("%Y-%m-%d"),
            })
        return {
            "type": "vertical_column",
            "points": pts,
            "camera_position": {"x": 120, "y": 140, "z": 160},
            "camera_look_at": {"x": 0, "y": 50, "z": 0},
        }

    
    # DATA RIBBON 
  
    def build_data_ribbon():
        pts = []
        golden = 137.5 * np.pi / 180
        for i in range(len(prices)):
            angle = i * golden
            radius = np.sqrt(i) * 0.3
            pts.append({
                "x": float(radius * np.cos(angle)),
                "y": float(scale[i] * 60),
                "z": float(radius * np.sin(angle)),
                "price": float(prices[i]),
                "index": i,
                "date": dates.iloc[i].strftime("%Y-%m-%d"),
            })
        return {
            "type": "data_ribbon",
            "points": pts,
            "camera_position": {"x": 40, "y": 50, "z": 40},
            "camera_look_at": {"x": 0, "y": 30, "z": 0},
        }

   
    #  GOLDEN SPIRAL 
   
    def build_golden_spiral():
        pts = []
        golden = 137.5 * np.pi / 180
        for i in range(len(prices)):
            angle = i * golden
            radius = i * 0.05
            height = i * 0.05
            pts.append({
                "x": float(radius * np.cos(angle)),
                "y": float(height),
                "z": float(radius * np.sin(angle)),
                "price": float(prices[i]),
                "index": i,
                "date": dates.iloc[i].strftime("%Y-%m-%d"),
            })
        return {
            "type": "golden_spiral",
            "points": pts,
            "camera_position": {"x": 80, "y": 80, "z": 90},
            "camera_look_at": {"x": 0, "y": (len(prices)*0.05)/2, "z": 0},
        }

    
    # CANDLE SPIRAL 
    
    def build_candle_spiral():
        close = df["Close"].values
        high = df["High"].values if "High" in df else close
        low = df["Low"].values if "Low" in df else close
        pts = []
        golden = 137.5 * np.pi / 180
        for i in range(len(close)):
            angle = i * golden
            radius = np.sqrt(i) * 0.25
            height = (high[i] - low[i]) * 0.02
            pts.append({
                "x": float(radius * np.cos(angle)),
                "y": float(height),
                "z": float(radius * np.sin(angle)),
                "open": float(df["Open"][i]) if "Open" in df else float(close[i]),
                "close": float(close[i]),
                "high": float(high[i]),
                "low": float(low[i]),
                "index": i
            })
        return {
            "type": "candle_spiral",
            "points": pts,
            "camera_position": {"x": 120, "y": 120, "z": 140},
            "camera_look_at": {"x": 0, "y": 20, "z": 0},
        }

    # ---- dispatch table --
    mapping = {
        "vertical_column": build_vertical_column,
        "data_ribbon": build_data_ribbon,
        "golden_spiral": build_golden_spiral,
        "candle_spiral": build_candle_spiral,
    }

    # Build chosen type — if anything fails → fallback
    try:
        return mapping[viz_type]()
    except:
        return build_vertical_column()

# INSIGHTS

def generate_insights(patterns):
    insights = []

    stats = patterns.get("statistics", {})
    if stats:
        insights.append(f"Analyzed {stats['total_days']} days")
        insights.append(f"Price: ${stats['price_min']:,.0f} → ${stats['price_max']:,.0f}")
        insights.append(f"Growth: {stats['total_growth']:.1f}%")

    fib = patterns.get("fibonacci_retracements", {})
    if "levels" in fib:
        insights.append("Fibonacci retracements detected")
        insights.append(f"Golden 0.618: ${fib['levels']['0.618']:,.0f}")

    exp = patterns.get("exponential_growth", {})
    if "growth_multiple" in exp:
        insights.append(f"Bull run growth: {exp['growth_multiple']:.1f}x")
        insights.append(f"Exponential R²: {exp['r_squared']:.3f}")

    cyc = patterns.get("market_cycles", {})
    if "cycle_period_months" in cyc:
        insights.append(f"Market cycle length: ~{cyc['cycle_period_months']} months")

    golden = patterns.get("golden_ratios", {})
    if golden.get("found_count", 0) > 0:
        insights.append(f"{golden['found_count']} golden ratio occurrences")

    return insights
# CLI


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No CSV file provided'}))
        sys.exit(1)

    csv_path = sys.argv[1]
    result = analyze_bitcoin_patterns(csv_path)
    print(json.dumps(result, indent=2))
