import requests

# Test the fish prediction endpoint
def test_fish_prediction():
    url = "http://localhost:9000/predict_fish"
    
    # Create a simple test file (you can replace this with an actual image file)
    try:
        # Test with a small test file
        test_content = b"fake image data for testing"
        files = {'file': ('test.jpg', test_content, 'image/jpeg')}
        
        print(f"Testing endpoint: {url}")
        response = requests.post(url, files=files)
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Backend is working!")
        else:
            print("❌ Backend returned an error")
            
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")

def test_health():
    url = "http://localhost:9000/health"
    try:
        response = requests.get(url)
        print(f"Health check: {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing Fish Prediction Backend")
    print("=" * 40)
    test_health()
    print()
    test_fish_prediction()
