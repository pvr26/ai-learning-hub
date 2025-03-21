import google.generativeai as genai
from flask import current_app
import json

class ChatService:
    def __init__(self):
        self.model = None
    
    def _init_gemini(self):
        if self.model is None:
            api_key = current_app.config.get('GOOGLE_API_KEY')
            if not api_key:
                current_app.logger.error("Google API key not found in configuration")
                return
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                current_app.logger.info("Gemini model initialized successfully")
            except Exception as e:
                current_app.logger.error(f"Failed to initialize Gemini model: {str(e)}")
                raise
    
    def get_response(self, query, relevant_resources):
        self._init_gemini()
        if not self.model:
            return {"error": "Google API key not configured"}, 500
            
        try:
            # Prepare context from relevant resources
            context = self._prepare_context(relevant_resources)
            
            # Create prompt
            prompt = f"""You are an AI learning assistant specializing in artificial intelligence and machine learning.
            Your role is to help users find and understand AI learning resources.
            Provide clear, concise answers and recommend relevant resources when appropriate.

            Context about available resources:
            {context}
            
            User query: {query}
            
            Please provide a helpful response and recommend relevant resources if available."""
            
            # Get response from Gemini
            response = self.model.generate_content(prompt)
            
            return {"response": response.text}
            
        except Exception as e:
            current_app.logger.error(f"Gemini API error: {str(e)}")
            return {"error": "Failed to get response from Gemini"}, 500
    
    def get_recommendations(self, bookmarked_resources):
        self._init_gemini()
        if not self.model:
            return {"error": "Google API key not configured"}, 500
            
        try:
            # Prepare context from bookmarked resources
            context = self._prepare_context(bookmarked_resources)
            
            # Create prompt
            prompt = f"""You are an AI learning assistant specializing in artificial intelligence and machine learning.
            Your role is to analyze the user's interests based on their bookmarked resources and recommend new learning materials.

            Based on the user's bookmarked resources:
            {context}
            
            Please recommend 5 new learning resources that would be valuable for the user.
            For each recommendation, provide a brief explanation of why it would be beneficial."""
            
            # Get recommendations from Gemini
            response = self.model.generate_content(prompt)
            
            return {"response": response.text}
            
        except Exception as e:
            current_app.logger.error(f"Gemini API error: {str(e)}")
            return {"error": "Failed to get recommendations from Gemini"}, 500
    
    def _prepare_context(self, resources):
        if not resources:
            return "No resources available."
        
        context = "Available resources:\n"
        for resource in resources:
            context += f"- {resource.title}\n"
            context += f"  Description: {resource.description}\n"
            context += f"  Category: {resource.category}\n"
            context += f"  URL: {resource.url}\n\n"
        
        return context

    def general_chat(self, message, conversation_history=None):
        self._init_gemini()
        if not self.model:
            return {"error": "Google API key not configured"}, 500
            
        try:
            # Create chat
            chat = self.model.start_chat(history=[])
            
            # Add system message
            chat.send_message("""You are an AI learning assistant specializing in artificial intelligence and machine learning.
            Your role is to help users understand AI concepts, provide explanations, and guide them in their learning journey.
            Be friendly, professional, and provide clear, concise answers.""")

            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history:
                    if msg['role'] == 'user':
                        chat.send_message(msg['content'])
                    elif msg['role'] == 'assistant':
                        # For assistant messages, we'll just send the content without specifying a role
                        chat.send_message(msg['content'])
            
            # Send current message and get response
            response = chat.send_message(message)
            
            if not response or not response.text:
                current_app.logger.error("Empty response from Gemini")
                return {"error": "Empty response from AI"}, 500
                
            return {"reply": response.text}
            
        except Exception as e:
            current_app.logger.error(f"Gemini API error: {str(e)}")
            current_app.logger.error(f"Error type: {type(e).__name__}")
            current_app.logger.error(f"Error details: {str(e)}")
            return {"error": f"Failed to get response from Gemini: {str(e)}"}, 500 