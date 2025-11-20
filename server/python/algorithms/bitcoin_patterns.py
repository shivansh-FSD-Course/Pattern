#!/usr/bin/env python3
import sys
import json
import pandas as pd
import numpy as np
from scipy.signal import find_peaks
from scipy.optimize import curve_fit
from scipy.fft import fft, fftfreq


def analyze_bitcoin_patterns(csv_path):
    """
    Main function that analyzes Bitcoin data and returns all detected patterns
    """
    try:
        # Load data
        df = pd.read_csv(csv_path)
        
        # Validate columns
        required_cols = ['Open time', 'Close']
        if not all(col in df.columns for col in required_cols):
            return {'error': 'Invalid CSV format. Missing required columns.'}
        
        # Run pattern detection
        patterns = {
            'fibonacci_retracements': detect_fibonacci_retracements(df),
            'exponential_growth': detect_exponential_growth(df),
            'market_cycles': detect_market_cycles(df),
            'golden_ratios': detect_golden_ratios(df),
            'statistics': calculate_statistics(df)
        }
        
        # Generate visualization data
        viz_data = generate_visualization_data(df, patterns)
        
        # Generate insights
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


def detect_fibonacci_retracements(df):
    """
    Detect Fibonacci retracement levels from major swing high/low
    """
    prices = df['Close'].values
    dates = pd.to_datetime(df['Open time'])
    
    # Find peaks and troughs (local maxima/minima)
    peaks_idx, _ = find_peaks(prices, distance=30, prominence=1000)
    troughs_idx, _ = find_peaks(-prices, distance=30, prominence=1000)
    
    if len(peaks_idx) == 0 or len(troughs_idx) == 0:
        return {'error': 'Not enough peaks/troughs found'}
    
    # Find the major swing (highest peak and lowest trough)
    swing_high_idx = peaks_idx[np.argmax(prices[peaks_idx])]
    swing_low_idx = troughs_idx[np.argmin(prices[troughs_idx])]
    
    swing_high = float(prices[swing_high_idx])
    swing_low = float(prices[swing_low_idx])
    
    # Calculate Fibonacci levels
    diff = swing_high - swing_low
    
    fib_levels = {
        '0.0': float(swing_low),
        '0.236': float(swing_low + diff * 0.236),
        '0.382': float(swing_low + diff * 0.382),
        '0.500': float(swing_low + diff * 0.500),
        '0.618': float(swing_low + diff * 0.618),
        '0.786': float(swing_low + diff * 0.786),
        '1.0': float(swing_high),
        '1.272': float(swing_high + diff * 0.272),
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
    """
    Detect exponential growth/decay phases
    """
    prices = df['Close'].values
    dates = pd.to_datetime(df['Open time'])
    
    # Find the strongest bull market phase

    cumulative_max = np.maximum.accumulate(prices)
    drawups = (prices - np.minimum.accumulate(prices)) / np.minimum.accumulate(prices)
    
    max_drawup_idx = np.argmax(drawups)
    max_drawup = float(drawups[max_drawup_idx])
    
    # Find the start of this bull run (look backwards from peak)
    start_idx = 0
    for i in range(max_drawup_idx - 1, -1, -1):
        if prices[i] < prices[start_idx] * 1.1:  # Allow 10% variance
            start_idx = i
    
    # Fit exponential curve to this segment
    segment_prices = prices[start_idx:max_drawup_idx+1]
    segment_time = np.arange(len(segment_prices))
    
    if len(segment_prices) < 10:
        return {'error': 'Bull market segment too short'}
    
    def exp_func(x, a, b):
        return a * np.exp(b * x)
    
    try:
        # Fit exponential
        params, _ = curve_fit(exp_func, segment_time, segment_prices, 
                             p0=[segment_prices[0], 0.01], maxfev=5000)
        
        # Calculate R² (goodness of fit)
        predicted = exp_func(segment_time, *params)
        ss_res = np.sum((segment_prices - predicted) ** 2)
        ss_tot = np.sum((segment_prices - np.mean(segment_prices)) ** 2)
        r_squared = float(1 - (ss_res / ss_tot))
        
        growth_multiple = float(segment_prices[-1] / segment_prices[0])
        
        return {
            'phase': 'bull_market',
            'start_date': dates.iloc[start_idx].strftime('%Y-%m-%d'),
            'end_date': dates.iloc[max_drawup_idx].strftime('%Y-%m-%d'),
            'start_price': float(segment_prices[0]),
            'end_price': float(segment_prices[-1]),
            'growth_multiple': growth_multiple,
            'growth_rate': float(params[1]),
            'r_squared': r_squared,
            'duration_days': int(max_drawup_idx - start_idx),
            'quality': 'excellent' if r_squared > 0.9 else 'good'
        }
        
    except Exception as e:
        return {'error': f'Exponential fit failed: {str(e)}'}


def detect_market_cycles(df):
    """
    Detect cyclical patterns using FFT (Fast Fourier Transform)
    """
    prices = df['Close'].values
    
    # Detrend the data (remove overall trend)
    from scipy import signal
    detrended = signal.detrend(prices)
    
    # Apply FFT
    fft_vals = fft(detrended)
    freqs = fftfreq(len(prices), d=1)  # d=1 means 1 day spacing
    
    # Only look at positive frequencies
    positive_freqs = freqs[:len(prices)//2]
    fft_magnitude = np.abs(fft_vals[:len(prices)//2])
    
    # Ignore DC component (0 frequency)
    fft_magnitude[0] = 0
    
    # Find dominant frequency
    dominant_idx = np.argmax(fft_magnitude)
    dominant_freq = positive_freqs[dominant_idx]
    
    if dominant_freq == 0:
        return {'error': 'No significant cycles detected'}
    
    # Convert frequency to period (in days)
    cycle_period_days = int(1 / abs(dominant_freq))
    
    # Calculate amplitude
    amplitude = float(fft_magnitude[dominant_idx] / len(prices) * 2)
    
    # Count number of complete cycles
    num_cycles = len(prices) // cycle_period_days
    
    return {
        'cycle_period_days': cycle_period_days,
        'cycle_period_months': round(cycle_period_days / 30.0, 1),
        'amplitude_usd': amplitude,
        'num_cycles': num_cycles,
        'pattern_strength': float(fft_magnitude[dominant_idx]),
        'cycle_quality': 'strong' if num_cycles >= 2 else 'moderate'
    }


def detect_golden_ratios(df):
    """
    Find price movements that follow the golden ratio (1.618)
    """
    GOLDEN_RATIO = 1.618
    TOLERANCE = 0.08  # 8% tolerance
    
    prices = df['Close'].values
    dates = pd.to_datetime(df['Open time'])
    
    # Find significant peaks
    peaks_idx, _ = find_peaks(prices, distance=30, prominence=1000)
    
    if len(peaks_idx) < 2:
        return {'found_count': 0, 'occurrences': []}
    
    golden_occurrences = []
    
    # Check ratios between consecutive peaks
    for i in range(len(peaks_idx) - 1):
        price1 = float(prices[peaks_idx[i]])
        price2 = float(prices[peaks_idx[i + 1]])
        
        ratio = price2 / price1
        
        # Check if close to golden ratio
        if abs(ratio - GOLDEN_RATIO) / GOLDEN_RATIO < TOLERANCE:
            golden_occurrences.append({
                'date1': dates.iloc[peaks_idx[i]].strftime('%Y-%m-%d'),
                'date2': dates.iloc[peaks_idx[i + 1]].strftime('%Y-%m-%d'),
                'price1': price1,
                'price2': price2,
                'ratio': float(ratio),
                'deviation_percent': float(abs(ratio - GOLDEN_RATIO) / GOLDEN_RATIO * 100)
            })
    
    # Also check inverse ratios (1/1.618 = 0.618)
    INVERSE_GOLDEN = 0.618
    
    for i in range(len(peaks_idx) - 1):
        price1 = float(prices[peaks_idx[i]])
        price2 = float(prices[peaks_idx[i + 1]])
        
        ratio = price2 / price1
        
        if abs(ratio - INVERSE_GOLDEN) / INVERSE_GOLDEN < TOLERANCE:
            golden_occurrences.append({
                'date1': dates.iloc[peaks_idx[i]].strftime('%Y-%m-%d'),
                'date2': dates.iloc[peaks_idx[i + 1]].strftime('%Y-%m-%d'),
                'price1': price1,
                'price2': price2,
                'ratio': float(ratio),
                'type': 'inverse_golden',
                'deviation_percent': float(abs(ratio - INVERSE_GOLDEN) / INVERSE_GOLDEN * 100)
            })
    
    return {
        'found_count': len(golden_occurrences),
        'occurrences': golden_occurrences[:10]  # Top 10
    }


def calculate_statistics(df):
    """
    Calculate basic statistics about the dataset
    """
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
        'total_growth': float((prices[-1] / prices[0] - 1) * 100),  # Percentage
        'volatility': float(prices.std() / prices.mean() * 100)
    }


def generate_visualization_data(df, patterns):
    """
    Generate 3D coordinates for visualization
    """
    prices = df['Close'].values
    dates = pd.to_datetime(df['Open time'])
    
    # Normalize prices for visualization (0 to 50 range)
    price_min = prices.min()
    price_max = prices.max()
    normalized_prices = (prices - price_min) / (price_max - price_min) * 50
    
    # Create spiral coordinates using golden angle
    GOLDEN_ANGLE = 137.5 * (np.pi / 180)
    
    spiral_points = []
    for i in range(len(prices)):
        angle = i * GOLDEN_ANGLE
        radius = np.sqrt(i) * 0.3  # Adjusted for better visualization
        
        spiral_points.append({
            'x': float(radius * np.cos(angle)),
            'y': float(normalized_prices[i]),
            'z': float(radius * np.sin(angle)),
            'price': float(prices[i]),
            'date': dates.iloc[i].strftime('%Y-%m-%d'),
            'index': i
        })
    
    # Fibonacci level rings
    fib_data = patterns.get('fibonacci_retracements', {})
    fib_rings = []
    
    if 'levels' in fib_data:
        for level_name, price in fib_data['levels'].items():
            normalized_y = (price - price_min) / (price_max - price_min) * 50
            
            # Color mapping
            color_map = {
                '0.0': '#C9A961',      # Gold
                '0.236': '#7BA591',    # Green
                '0.382': '#8B7BA8',    # Purple
                '0.500': '#5C8BB8',    # Blue
                '0.618': '#FFD700',    # Bright Gold (GOLDEN RATIO!)
                '0.786': '#B85C5C',    # Red
                '1.0': '#C9A961',      # Gold
                '1.618': '#FF6B6B'     # Bright Red (extension)
            }
            
            fib_rings.append({
                'level': level_name,
                'y': float(normalized_y),
                'price': float(price),
                'color': color_map.get(level_name, '#7BA591'),
                'is_golden': level_name in ['0.618', '1.618']
            })
    
    return {
        'type': 'golden_spiral',
        'points': spiral_points,
        'fibonacci_rings': fib_rings,
        'camera_position': {'x': 40, 'y': 30, 'z': 40},
        'camera_look_at': {'x': 0, 'y': 25, 'z': 0}
    }


def generate_insights(patterns):
    """
    Generate human-readable insights
    """
    insights = []
    
    # Statistics
    stats = patterns.get('statistics', {})
    if stats:
        insights.append(f" Analyzed {stats['total_days']} days of Bitcoin price data")
        insights.append(f" Price range: ${stats['price_min']:,.0f} → ${stats['price_max']:,.0f}")
        
        if stats['total_growth'] > 0:
            insights.append(f" Overall growth: +{stats['total_growth']:.1f}%")
        else:
            insights.append(f" Overall change: {stats['total_growth']:.1f}%")
    
    # Fibonacci
    fib = patterns.get('fibonacci_retracements', {})
    if 'levels' in fib:
        insights.append(f" Detected {len(fib['levels'])} Fibonacci retracement levels")
        insights.append(f" Golden ratio support at ${fib['levels']['0.618']:,.0f}")
        insights.append(f" Major swing: ${fib['swing_low']:,.0f} to ${fib['swing_high']:,.0f}")
    
    # Exponential growth
    exp = patterns.get('exponential_growth', {})
    if 'growth_multiple' in exp:
        insights.append(f" Exponential bull market: {exp['growth_multiple']:.1f}x growth over {exp['duration_days']} days")
        insights.append(f" Exponential fit quality: R² = {exp['r_squared']:.3f}")
    
    # Cycles
    cycles = patterns.get('market_cycles', {})
    if 'cycle_period_months' in cycles:
        insights.append(f" Market cycles detected: ~{cycles['cycle_period_months']} month periods")
        insights.append(f" Found {cycles['num_cycles']} complete boom-bust cycles")
    
    # Golden ratios
    golden = patterns.get('golden_ratios', {})
    if golden.get('found_count', 0) > 0:
        insights.append(f" Found {golden['found_count']} price movements following the golden ratio (φ = 1.618)")
    
    return insights


# CLI interface for testing
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No CSV file provided'}))
        sys.exit(1)
    
    csv_path = sys.argv[1]
    result = analyze_bitcoin_patterns(csv_path)
    print(json.dumps(result, indent=2))