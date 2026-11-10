/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SyntheticDataBanner } from './components/common/SyntheticDataBanner';
import { CustomCursor } from './components/common/CustomCursor';

import { DashboardPage } from './pages/DashboardPage';
import { EmployeeDirectoryPage } from './pages/EmployeeDirectoryPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { DailyActivitySubmitPage } from './pages/DailyActivitySubmitPage';
import { ActivityHistoryPage } from './pages/ActivityHistoryPage';
import { KnowledgeRepositoryPage } from './pages/KnowledgeRepositoryPage';
import { DocumentManagementPage } from './pages/DocumentManagementPage';
import { AIKnowledgeInsightsPage } from './pages/AIKnowledgeInsightsPage';
import { HandoverManagementPage } from './pages/HandoverManagementPage';
import { HandoverReviewPage } from './pages/HandoverReviewPage';
import { SuccessorAssistantPage } from './pages/SuccessorAssistantPage';
import { AdminPermissionsPage } from './pages/AdminPermissionsPage';
import { LoginPage } from './pages/LoginPage';

function AppLayout() {
  const { currentUser, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center text-white text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING WORKTRACE KNOWLEDGE ENGINE...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <CustomCursor />
        <LoginPage />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col antialiased selection:bg-[#FF6B00] selection:text-white">
      {/* Precision Custom Cursor for Desktop */}
      <CustomCursor />

      {/* Top Demonstration Notice Banner */}
      <SyntheticDataBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Role-Aware Left Navigation */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Content Stream */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />

          <main className="flex-1 pb-16">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeeDirectoryPage />} />
              <Route path="/employees/:id" element={<EmployeeProfilePage />} />
              <Route path="/submit-activity" element={<DailyActivitySubmitPage />} />
              <Route path="/activity-history" element={<ActivityHistoryPage />} />
              <Route path="/knowledge" element={<KnowledgeRepositoryPage />} />
              <Route path="/documents" element={<DocumentManagementPage />} />
              <Route path="/ai-insights" element={<AIKnowledgeInsightsPage />} />
              <Route path="/handovers" element={<HandoverManagementPage />} />
              <Route path="/handovers/:id" element={<HandoverReviewPage />} />
              <Route path="/successor-assistant" element={<SuccessorAssistantPage />} />
              <Route path="/admin" element={<AdminPermissionsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
