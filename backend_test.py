import requests
import sys
import json
from datetime import datetime

class GOLearningPlatformTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.current_user = None
        self.access_codes = {
            "user": "GO2025_UserAccess_7X9K",
            "admin": "ADMIN_Control_P4N3L_2025"
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.user_token:
            test_headers['Authorization'] = f'Bearer {self.user_token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_login_with_code(self, access_code, role_type="user"):
        """Test login with access code"""
        success, response = self.run_test(
            f"Login with {role_type} code",
            "POST",
            "auth/login",
            200,
            data={"code": access_code}
        )
        if success and 'access_token' in response:
            if role_type == "user":
                self.user_token = response['access_token']
            else:
                self.admin_token = response['access_token']
            self.current_user = response.get('user', {})
            print(f"   Logged in as: {self.current_user.get('full_name', 'Unknown')} ({self.current_user.get('role', 'Unknown')})")
            return True
        return False

    def test_invalid_code_login(self):
        """Test login with invalid code"""
        success, response = self.run_test(
            "Login with invalid code",
            "POST",
            "auth/login",
            401,  # Should return 401 for invalid code
            data={"code": "INVALID_CODE_123"}
        )
        return success

    def test_missing_code_login(self):
        """Test login without code"""
        success, response = self.run_test(
            "Login without code",
            "POST",
            "auth/login",
            400,  # Should return 400 for missing code
            data={}
        )
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_lessons(self):
        """Test getting all lessons"""
        success, response = self.run_test(
            "Get All Lessons",
            "GET",
            "lessons",
            200
        )
        if success:
            lessons = response if isinstance(response, list) else []
            print(f"   Found {len(lessons)} lessons")
            return lessons
        return []

    def test_get_lessons_by_difficulty(self, difficulty):
        """Test getting lessons by difficulty"""
        success, response = self.run_test(
            f"Get {difficulty.title()} Lessons",
            "GET",
            f"lessons?difficulty={difficulty}",
            200
        )
        if success:
            lessons = response if isinstance(response, list) else []
            print(f"   Found {len(lessons)} {difficulty} lessons")
            return lessons
        return []

    def test_get_lesson_by_id(self, lesson_id):
        """Test getting a specific lesson"""
        success, response = self.run_test(
            f"Get Lesson {lesson_id}",
            "GET",
            f"lessons/{lesson_id}",
            200
        )
        return success, response

    def test_start_lesson(self, lesson_id):
        """Test starting a lesson"""
        success, response = self.run_test(
            f"Start Lesson {lesson_id}",
            "POST",
            f"lessons/{lesson_id}/progress",
            200
        )
        return success

    def test_complete_lesson(self, lesson_id):
        """Test completing a lesson"""
        success, response = self.run_test(
            f"Complete Lesson {lesson_id}",
            "PUT",
            f"lessons/{lesson_id}/complete",
            200
        )
        return success

    def test_get_lesson_quizzes(self, lesson_id):
        """Test getting quizzes for a lesson"""
        success, response = self.run_test(
            f"Get Quizzes for Lesson {lesson_id}",
            "GET",
            f"lessons/{lesson_id}/quizzes",
            200
        )
        if success:
            quizzes = response if isinstance(response, list) else []
            print(f"   Found {len(quizzes)} quizzes")
            return quizzes
        return []

    def test_get_classes(self):
        """Test getting classes for current user"""
        success, response = self.run_test(
            "Get Classes",
            "GET",
            "classes",
            200
        )
        if success:
            classes = response if isinstance(response, list) else []
            print(f"   Found {len(classes)} classes")
            return classes
        return []

    def test_get_user_achievements(self, user_id):
        """Test getting user achievements"""
        success, response = self.run_test(
            f"Get User Achievements",
            "GET",
            f"users/{user_id}/achievements",
            200
        )
        if success:
            achievements = response if isinstance(response, list) else []
            print(f"   Found {len(achievements)} achievements")
            return achievements
        return []

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        old_token = self.user_token
        self.user_token = None
        
        success, response = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "auth/me",
            401  # Should fail with 401
        )
        
        self.user_token = old_token
        return success

    def test_admin_only_access_with_user_token(self):
        """Test admin endpoint with user token (should fail)"""
        old_token = self.user_token
        
        success, response = self.run_test(
            "Admin Endpoint with User Token",
            "GET",
            "users",
            403  # Should fail with 403
        )
        
        return success

    def test_admin_access_with_admin_token(self):
        """Test admin endpoint with admin token (should succeed)"""
        old_token = self.user_token
        self.user_token = self.admin_token
        
        success, response = self.run_test(
            "Admin Endpoint with Admin Token",
            "GET",
            "users",
            200  # Should succeed
        )
        
        self.user_token = old_token
        return success

def main():
    print("🚀 Starting GO Learning Platform API Tests")
    print("Testing Code-Based Authentication System")
    print("=" * 50)
    
    tester = GOLearningPlatformTester()
    
    # Test basic endpoints first
    print("\n📋 BASIC ENDPOINT TESTS")
    print("-" * 30)
    
    if not tester.test_health_check():
        print("❌ Health check failed - API may be down")
        return 1
    
    if not tester.test_root_endpoint():
        print("❌ Root endpoint failed")
        return 1

    # Test unauthorized access
    print("\n🔒 SECURITY TESTS")
    print("-" * 30)
    
    tester.test_unauthorized_access()

    # Test authentication with access codes
    print("\n🔐 CODE-BASED AUTHENTICATION TESTS")
    print("-" * 30)
    
    # Test invalid and missing codes first
    tester.test_invalid_code_login()
    tester.test_missing_code_login()
    
    # Test valid codes
    user_login_success = tester.test_login_with_code(tester.access_codes["user"], "user")
    admin_login_success = tester.test_login_with_code(tester.access_codes["admin"], "admin")
    
    if not user_login_success and not admin_login_success:
        print("❌ No successful logins - cannot continue with protected endpoint tests")
        return 1

    # Test role-based access control
    print("\n🛡️  ROLE-BASED ACCESS CONTROL TESTS")
    print("-" * 30)
    
    if user_login_success:
        # Test getting current user info with user token
        tester.test_get_current_user()
        
        # Test admin endpoint with user token (should fail)
        tester.test_admin_only_access_with_user_token()
    
    if admin_login_success:
        # Test admin endpoint with admin token (should succeed)
        tester.test_admin_access_with_admin_token()

    # Continue with user functionality tests
    if user_login_success:
        print("\n📚 USER FUNCTIONALITY TESTS")
        print("-" * 30)
        
        # Test lessons functionality
        lessons = tester.test_get_lessons()
        
        if lessons:
            # Test getting lessons by difficulty
            for difficulty in ["beginner", "intermediate", "advanced"]:
                tester.test_get_lessons_by_difficulty(difficulty)
            
            # Test getting a specific lesson
            first_lesson = lessons[0]
            lesson_id = first_lesson.get('id')
            if lesson_id:
                success, lesson_data = tester.test_get_lesson_by_id(lesson_id)
                
                if success:
                    # Test lesson progress
                    tester.test_start_lesson(lesson_id)
                    tester.test_complete_lesson(lesson_id)
                    
                    # Test getting quizzes for the lesson
                    tester.test_get_lesson_quizzes(lesson_id)
        
        # Test classes functionality
        tester.test_get_classes()
        
        # Test achievements
        if tester.current_user and tester.current_user.get('id'):
            tester.test_get_user_achievements(tester.current_user['id'])

    # Print final results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"Total tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - check the output above for details")
        return 1

if __name__ == "__main__":
    sys.exit(main())