# Product Requirements Document (PRD)  
**Project Name:** WanderGroup MVP  
**Document Version:** 1.0  
**Author:** [Your Name] (Product Manager)  
**Date:** [Current Date]  

---

## 1. Executive Summary  

**Problem**  
Many travel enthusiasts, especially those on a budget, find it difficult to find like-minded people to travel with. They either end up traveling alone, which can be expensive, or with people they don't know well, leading to a suboptimal experience. The process of planning a trip itinerary is also time-consuming and often requires juggling multiple tools.  

**Solution**  
WanderGroup is a mobile application that allows users to create and join group trips based on shared interests and budget. It leverages AI to generate personalized itineraries and uses Google Maps API to provide a visual and logistical plan, making group travel more accessible, affordable, and enjoyable.  

**Target Audience**  
Budget-conscious and enthusiastic travelers aged **20–35**, who are open to meeting new people and sharing travel experiences. This includes college students, young professionals, and solo adventurers.  

**Business Goals (MVP)**  
- Achieve **5,000 user sign-ups** within the first 3 months.  
- Generate at least **1,000 trip group creations**.  
- Demonstrate high engagement with a **30% MoM increase in active users**.  
- Validate the core value proposition of connecting like-minded travelers.  

---

## 2. User Personas  

**Persona 1: The Budget-Savvy Explorer (Primary)**  
- **Name:** Priya Sharma  
- **Age:** 24  
- **Occupation:** Recent college graduate, marketing job  
- **Goals:** Explore new places (hills, beaches), travel affordably, meet new people.  
- **Frustrations:** Budget misalignment with friends, rigid/expensive group tours, overwhelming logistics.  

**Persona 2: The Social Adventurer**  
- **Name:** Karan Singh  
- **Age:** 28  
- **Occupation:** Software Engineer  
- **Goals:** Enjoys solo trips but wants travel buddies for shared experiences and costs.  
- **Frustrations:** Difficulty finding trustworthy travelers online, lack of vetting/community trust.  

---

## 3. Functional Requirements (User Stories)  

### User Onboarding & Profile  
- **AS A new user**, I want to create an account with name, email, and profile picture, **SO THAT** others can see who I am.  
- **AS A new user**, I want to answer travel preference questions (destinations, group size, etc.), **SO THAT** the app can recommend relevant trips.  

### Trip Discovery & Joining  
- **AS A user**, I want to see a dashboard of trips in my city and others, **SO THAT** I can find a group to join.  
- **AS A user**, I want filters (destination, date, group type, budget), **SO THAT** I can refine my search.  
- **AS A user**, I want to send join requests, **SO THAT** I can ask admins for permission.  
- **AS A group admin**, I want to view profiles of join requests, **SO THAT** I can decide whom to accept.  
- **AS A user**, I want to see trip status (Full, On-Going, Open), **SO THAT** I know availability.  

### Trip Creation (Admin Side)  
- **AS A user**, I want to create a trip group with destination, dates, budget, and group size, **SO THAT** I can attract the right people.  
- **AS A group creator**, I want to view/judge requests, **SO THAT** I can build the right group.  

### AI-Powered Itinerary  
- **AS A group admin**, I want AI-generated itineraries based on trip info, **SO THAT** planning is easier.  
- **AS A group member**, I want to see daily itineraries with costs, maps, and travel times, **SO THAT** I can prepare.  
- **AS A group member**, I want to vote on suggested places, **SO THAT** the group finalizes the itinerary collectively.  

### Group Communication  
- **AS A group member**, I want access to group chat after approval, **SO THAT** I can coordinate with others.  
- **AS A group member**, I want the itinerary visible inside chat, **SO THAT** everyone sees the plan.  
- **AS A group admin**, I want to remove members if needed, **SO THAT** I ensure group safety.  

### Safety & Trust  
- **AS A user**, I want to rate members post-trip, **SO THAT** trust builds within the platform.  
- **AS A user**, I want to report inappropriate behavior, **SO THAT** I feel safe.  

---

## 4. Technical Requirements  

- **Platform:** Native mobile apps (iOS + Android).  
- **Database:** Cloud-based, scalable (e.g., Firebase, AWS DynamoDB).  
- **APIs:**  
  - **AI Service:** LLM integration (e.g., Gemini) for itineraries.  
  - **Google Maps API:** Maps, Places, Directions for trip visualization.  
  - **Authentication:** Firebase Auth (secure login/sign-up).  
  - **Notifications:** Push notifications for requests and approvals.  

---

## 5. Success Metrics  

**Core Metrics**  
- Weekly new user sign-ups.  
- Weekly new trip group creations.  
- User engagement (DAU/MAU).  
- Number of successful group matches.  

**Qualitative Metrics**  
- User feedback & app store reviews.  
- Positive social media sentiment.  

---

## 6. Out of Scope (MVP)  

- **Monetization:** No payments/in-app purchases. Focus on growth and validation.  
- **Booking Integrations:** No direct bookings (flights, hotels, activities). AI only suggests options.  
- **Advanced Social Features:** No forums/news feeds; only group chat.  
- **Complex Moderation:** No automated moderation; handled manually via user reports.  

---
