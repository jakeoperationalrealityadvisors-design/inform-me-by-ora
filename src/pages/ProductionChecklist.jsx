import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckSquare, Square, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import RoleGuard from '@/components/auth/RoleGuard';

const CHECKLIST = [
  {
    id: 'core-access', title: '1. Core App Access', items: [
      'App loads from the main URL without errors',
      'App loads on first try',
      'App does not hang on splash/loading screen',
      'No blank white screen on load',
      'No console-breaking fatal errors',
      'No missing environment variables',
      'No broken deployment after latest push',
      'Domain points to correct live app',
      'SSL/HTTPS is active',
      'No browser security warnings',
      'Correct favicon appears',
      'Correct app name appears in browser tab',
      'App metadata/title/description are correct',
    ]
  },
  {
    id: 'visual', title: '2. First Impression / Visual Audit', items: [
      'Logo displays correctly',
      'Branding is consistent across all pages',
      'Fonts load correctly',
      'Font sizes are readable',
      'Button styles are consistent',
      'Card styles are consistent',
      'Shadows/borders/radius are consistent',
      'No weird spacing gaps',
      'No overlapping text',
      'No cut-off text',
      'No stretched images',
      'No blurry icons',
      'No placeholder text left behind',
      'No lorem ipsum anywhere',
      'No "test", "demo", or temp labels visible',
      'No debug panels showing to users',
      'No raw JSON visible in UI',
      'No broken image icons',
      'Empty states look intentional',
      'Loading states look intentional',
      'Error states look intentional',
      'Success states look intentional',
    ]
  },
  {
    id: 'navigation', title: '3. Navigation', items: [
      'All nav links work',
      'Top nav works',
      'Sidebar nav works',
      'Footer links work',
      'Logo click returns to correct home/dashboard page',
      'Back buttons work',
      'Browser back button does not break app state',
      'Forward button behaves correctly',
      'Deep links open correct page',
      'Protected routes redirect properly',
      'Public routes stay public',
      'No dead-end pages',
      'No nav item leads to 404',
      'Active page is visibly highlighted',
      'Menus open and close properly',
      'Dropdowns close when expected',
      'Mobile nav opens properly',
      'Mobile nav closes properly',
      'No menu overlay stuck on screen',
      'No hidden page impossible to reach',
    ]
  },
  {
    id: 'touch', title: '4. Touch, Tap, Click, Gesture, Movement', items: [
      'Every button can be tapped easily on mobile',
      'Tap targets are large enough',
      'No buttons too close together',
      'No accidental double-tap issues',
      'No dead tap zones',
      'Every clickable thing feels obviously clickable',
      'Hover states exist where needed on desktop',
      'Hover-only actions are not required on mobile',
      'Pressed states work on buttons',
      'Disabled states look disabled',
      'Swipe actions work if included',
      'Swipe does not trigger wrong action',
      'Scroll is smooth on mobile',
      'Scroll is smooth on desktop',
      'Horizontal scroll only exists where intentional',
      'No unexpected sideways scrolling',
      'Drag-and-drop works if included',
      'Sliders move correctly',
      'Toggle switches respond correctly',
      'Checkboxes tap correctly',
      'Radio buttons tap correctly',
      'Accordions expand/collapse correctly',
      'Bottom sheets/modals can be closed easily',
      'Modals close on X button',
      'Modals close on outside click if intended',
      'Escape key closes modal if intended',
      'No trapped overlay prevents user from continuing',
      'Keyboard tab movement works on forms',
      'Enter key submits where appropriate',
      'Spacebar actions work where appropriate',
    ]
  },
  {
    id: 'responsive', title: '5. Responsive Layout / Device Testing', items: [
      'Works on desktop large screen',
      'Works on laptop',
      'Works on tablet portrait',
      'Works on tablet landscape',
      'Works on phone portrait',
      'Works on phone landscape',
      'No layout breaks at common widths',
      'Test at 320px width',
      'Test at 375px width',
      'Test at 390px width',
      'Test at 414px width',
      'Test at 768px width',
      'Test at 1024px width',
      'Test at 1280px+ width',
      'Headers don\'t wrap badly',
      'Buttons don\'t overflow containers',
      'Cards stack properly',
      'Tables remain usable',
      'Modals fit screen height',
      'Sticky headers don\'t cover content',
      'Bottom bars don\'t cover buttons',
      'Safe-area spacing works on mobile',
      'Keyboard opening on mobile doesn\'t hide fields',
      'Inputs stay visible when typing',
      'No impossible-to-tap CTA below fold due to fixed UI',
    ]
  },
  {
    id: 'auth', title: '6. Authentication / Account Access', items: [
      'Sign up works',
      'Login works',
      'Logout works',
      'Wrong password shows proper error',
      'Invalid email shows proper validation',
      'Password reset works',
      'Reset email sends',
      'Reset link works',
      'Email verification works if used',
      'Social login works if offered',
      'Session persists after refresh',
      'Session expires correctly when expected',
      'Logged-out users cannot access protected routes',
      'Logged-in users are redirected away from auth pages if intended',
      'New user onboarding triggers correctly',
      'User record is created correctly in database',
      'Duplicate account prevention works',
      'Account deletion works if offered',
      'Profile update works',
      'Change password works',
      'Change email works if offered',
      'No auth loop between pages',
      'No spinner forever after login',
      'Subscription/account state syncs correctly after login',
    ]
  },
  {
    id: 'forms', title: '7. Forms', items: [
      'Every form field accepts correct input',
      'Required fields are actually required',
      'Optional fields are actually optional',
      'Validation messages appear clearly',
      'Validation messages disappear when fixed',
      'Bad input is blocked properly',
      'Good input is accepted properly',
      'Form submit button works',
      'Form submit button disables during submission',
      'Double submit is prevented',
      'Success confirmation appears',
      'Error confirmation appears',
      'Draft saving works if included',
      'Multi-step forms preserve progress',
      'Back button in multi-step forms preserves previous data',
      'Dropdown selections save correctly',
      'Date pickers work',
      'Time pickers work',
      'Number fields handle numbers properly',
      'Currency fields format properly',
      'Phone fields format properly',
      'Textareas keep line breaks',
      'File upload works',
      'File upload size limits are clear',
      'Unsupported file types are rejected properly',
      'Uploaded file previews work if intended',
      'Removing uploaded file works',
      'Form data reaches backend correctly',
      'Saved form data reappears correctly when reopened',
    ]
  },
  {
    id: 'features', title: '8. Core Feature Functionality', items: [
      'Create works',
      'Read/view works',
      'Edit/update works',
      'Delete/remove works',
      'Restore/undo works if offered',
      'Archive works if offered',
      'Duplicate/copy works if offered',
      'Share works if offered',
      'Export works if offered',
      'Import works if offered',
      'Search works',
      'Filter works',
      'Sort works',
      'Pagination works',
      'Infinite scroll works if used',
      'Bulk actions work if used',
      'Empty state appears correctly when no data exists',
      'First-time use state appears correctly',
      'Returning user sees correct existing data',
      'Recent items display correctly',
      'Counts/stats update correctly',
      'Permissions limit access correctly',
      'Feature flags behave correctly',
      'Disabled features are hidden or labeled properly',
    ]
  },
  {
    id: 'search', title: '9. Search / Filter / Sort', items: [
      'Search returns expected results',
      'Search handles partial words',
      'Search handles no results',
      'Search handles special characters',
      'Search handles typo-ish user behavior decently',
      'Search clears properly',
      'Filter combinations work together',
      'Reset filters works',
      'Sorting ascending works',
      'Sorting descending works',
      'Sorted data remains correct after refresh',
      'Filtered counts match visible records',
      'No ghost/old cached result shows wrong data',
    ]
  },
  {
    id: 'data', title: '10. Data Integrity', items: [
      'Data saved by user actually persists',
      'Refresh does not wipe saved data',
      'User only sees their own data',
      'Shared/team data permissions work if applicable',
      'Editing one record does not affect another',
      'Deleting a record deletes correct one',
      'Record IDs map correctly',
      'Timestamps are correct',
      'Timezone handling is correct',
      'Currency handling is correct',
      'Numbers round/display correctly',
      'No duplicate records created accidentally',
      'Retry logic does not duplicate submissions',
      'Data syncs correctly between UI and DB',
      'Cached data refreshes when it should',
      'Stale data is not shown as live',
      'Webhook updates sync correctly if used',
    ]
  },
  {
    id: 'payments', title: '11. Payment / Billing / Subscription', items: [
      'Pricing displayed correctly',
      'Monthly plans correct',
      'Yearly plans correct',
      'Trial messaging correct',
      'Trial length correct',
      'Checkout button works',
      'Checkout opens correct Stripe/payment page',
      'Correct plan ID used for each option',
      'Successful payment returns user correctly',
      'Cancelled payment returns user correctly',
      'Subscription activates after payment',
      'Trial activates correctly',
      'Failed payment state handled properly',
      'Webhook receives checkout events',
      'Webhook receives subscription update events',
      'Webhook receives cancellation events',
      'User account updates to correct paid tier',
      'Paid features unlock correctly',
      'Unpaid users are blocked correctly',
      'Billing portal link works if offered',
      'Upgrade works',
      'Downgrade works',
      'Cancellation works',
      'Expired subscription downgrades access correctly',
      'Add-on purchases work if used',
      'Receipts/emails send if expected',
      'No one gets paid access for free by accident',
      'No paying user remains locked out after purchase',
      'Test mode is fully removed from production',
      'Live keys are being used in production',
      'No secret keys exposed in frontend',
      'Pricing page copy matches actual billing behavior',
    ]
  },
  {
    id: 'notifications', title: '12. Notifications / Emails / Messages', items: [
      'Success toasts appear',
      'Error toasts appear',
      'Warning toasts appear',
      'Toast text is understandable',
      'Toasts do not block UI',
      'Toasts disappear appropriately',
      'Emails send when expected',
      'Welcome email works if used',
      'Reset password email works',
      'Verification email works',
      'Billing email works if expected',
      'Email templates look good on mobile',
      'Email links work',
      'In-app notifications open correct destination',
      'Badge counts update correctly',
      'Push notifications work if supported',
      'Push permission handling is clean',
    ]
  },
  {
    id: 'mobile-ux', title: '13. Mobile-Specific UX', items: [
      'Mobile keyboard does not cover submit button',
      'Sticky bottom CTA stays usable',
      'Inputs autofocus sensibly',
      'Numeric keyboard opens for numeric fields',
      'Email keyboard opens for email fields',
      'Date selector is usable on mobile',
      'Dropdown menus are usable on small screens',
      'Drag interactions don\'t fight with vertical scrolling',
      'Pull-to-refresh works only if intended',
      'No accidental zoom from tiny input fields',
      '100vh sections behave properly on mobile browsers',
      'Bottom browser bar doesn\'t cover critical UI',
      'Touch scrolling inside modals works',
    ]
  },
  {
    id: 'frontend', title: '14. Frontend Code Quality', items: [
      'No obvious console errors',
      'No obvious console warnings worth fixing',
      'No failed network calls on normal usage',
      'No missing asset references',
      'No undefined/null crash paths in normal flows',
      'Loading states exist for async actions',
      'Error boundaries exist where needed',
      'Suspense/loading placeholders look acceptable',
      'Components render with real data',
      'Components handle empty/null data safely',
      'Components handle slow network safely',
      'Components handle API failure safely',
      'No hard-coded dev/test strings remain',
      'No test credentials visible',
      'No internal IDs exposed unnecessarily',
      'No fake mock data left in production views',
    ]
  },
  {
    id: 'backend', title: '15. Backend / API / Server', items: [
      'All API routes respond',
      'API routes return expected status codes',
      'API auth checks work',
      'Unauthorized requests are blocked',
      'Rate limiting works if used',
      'Server logs are clean enough',
      'No crashing endpoint under normal use',
      'Input sanitization exists',
      'Validation exists server-side, not just client-side',
      'DB writes succeed',
      'DB reads succeed',
      'DB updates succeed',
      'DB deletes succeed',
      'Background jobs work if used',
      'Cron/scheduled tasks work if used',
      'Webhooks respond with correct status',
      'Retry handling exists where needed',
      'Timeout handling exists',
      'Third-party API failures are handled gracefully',
      'Secrets are in server env only',
      'No private keys exposed',
      'CORS settings are correct',
      'Production database is correct database',
      'Staging/dev database is not wired by mistake',
      'File storage works if used',
      'Uploaded files store correctly',
      'Uploaded files retrieve correctly',
      'Deleted files are actually removed if intended',
    ]
  },
  {
    id: 'database', title: '16. Database / Internal Records', items: [
      'Tables/collections exist as expected',
      'Required columns/fields are present',
      'Foreign key relationships behave correctly',
      'New user creation triggers related records if required',
      'Cascade delete/update behaves correctly',
      'Indexes exist for important queries',
      'No duplicate junk test rows polluting live app',
      'Test users removed or labeled',
      'Seed/demo content removed if not intended',
      'Data backups exist',
      'Restore path exists if something explodes',
      'Logs or audit trail work if needed',
    ]
  },
  {
    id: 'performance', title: '17. Performance', items: [
      'Home page loads fast enough',
      'Dashboard loads fast enough',
      'Images are optimized',
      'No giant uncompressed assets',
      'Lazy loading used where appropriate',
      'No obviously bloated bundles',
      'Repeated actions do not slow down app',
      'Scroll remains smooth with real data',
      'Search remains usable with real data',
      'Mobile performance acceptable on weaker devices',
      'No memory leak symptoms',
      'No endless re-renders',
      'API calls are not duplicated unnecessarily',
      'Loading spinners are not excessively long',
      'Caching is working where appropriate',
    ]
  },
  {
    id: 'a11y', title: '18. Accessibility / Usability', items: [
      'Text contrast is readable',
      'Buttons have readable labels',
      'Links are distinguishable',
      'Inputs have labels',
      'Error messages are clear',
      'Required fields are marked clearly',
      'Keyboard navigation works',
      'Focus states are visible',
      'Screen-reader labels exist where possible',
      'Icons with actions have text or aria labels',
      'Color is not the only indicator of meaning',
      'App remains usable when zoomed in',
      'Success/error messages are understandable to normal humans',
    ]
  },
  {
    id: 'security', title: '19. Security / Privacy', items: [
      'Secret keys are not exposed client-side',
      'API keys are protected',
      'Auth tokens handled safely',
      'Cookies/session settings are correct',
      'Protected data not exposed in page source',
      'User cannot access another user\'s data by changing URL/ID',
      'Admin routes are protected',
      'No debug endpoints exposed',
      'No open test webhook endpoints left insecure',
      'Sensitive logs are not dumped publicly',
      'Passwords are never stored plain text',
      'User uploads are validated',
      'Input escaping/sanitization prevents obvious injection problems',
      'Terms/privacy pages exist if needed',
      'Payment flow is compliant enough for your platform usage',
      'Account deletion/privacy requests can be handled if required',
    ]
  },
  {
    id: 'errors', title: '20. Error Handling / Edge Cases', items: [
      'Bad internet connection handled gracefully',
      'Server offline message is understandable',
      'API timeout handled gracefully',
      'Empty fields handled properly',
      'Extremely long text handled properly',
      'Special characters handled properly',
      'Duplicate clicks handled properly',
      'Refresh during flow handled properly',
      'User closes tab during action and comes back safely',
      'Expired session mid-action handled properly',
      'Deleted record no longer accessible',
      'Missing image/file fallback works',
      'Third-party service outage doesn\'t completely destroy UX',
      '404 page exists',
      '500/error page exists or error fallback exists',
      'User can recover from common mistakes without rage quitting',
    ]
  },
  {
    id: 'content', title: '21. Content / Copy / Language', items: [
      'All page titles are correct',
      'All headings are correct',
      'All buttons say the right thing',
      'Grammar/spelling checked',
      'Pricing text matches billing reality',
      'Trial text matches actual trial',
      'Placeholder content removed',
      'Legal pages updated',
      'Contact info correct',
      'Support email correct',
      'App store/site descriptions correct if used',
      'Empty-state copy is helpful',
      'Error copy is helpful',
      'Success copy is clear',
      'No misleading claims',
      'No old brand name left behind after rename/rebrand',
    ]
  },
  {
    id: 'analytics', title: '22. Analytics / Tracking / Monitoring', items: [
      'Analytics installed if intended',
      'Page views tracked',
      'Signups tracked',
      'Purchases tracked',
      'Trial starts tracked',
      'Failed checkout tracked if intended',
      'Key feature usage tracked',
      'Error monitoring works',
      'Production logs accessible',
      'Alerting works if set up',
      'UTM/referral tracking works if relevant',
      'Meta pixel / ads tracking works if relevant',
      'Duplicate events are not firing',
    ]
  },
  {
    id: 'seo', title: '23. SEO / Public Web Presence', items: [
      'Meta title correct',
      'Meta description correct',
      'Open Graph image correct',
      'Social share preview looks good',
      'Sitemap exists if needed',
      'Robots settings correct',
      'Canonical URLs correct',
      'No accidental noindex on live pages',
      'Public landing page CTA works',
      'Terms/privacy links work',
      'App screenshots match current app',
    ]
  },
  {
    id: 'browsers', title: '24. Browser Testing', items: [
      'Chrome tested',
      'Edge tested',
      'Safari tested if possible',
      'Firefox tested if possible',
      'Mobile Chrome tested',
      'Mobile Safari tested if possible',
      'No browser-specific visual breakage',
      'Date/time/input controls behave acceptably across browsers',
    ]
  },
  {
    id: 'user-flows', title: '25. Real User Flow Testing', items: [
      'Anonymous: Visit landing page',
      'Anonymous: Read value prop',
      'Anonymous: Click CTA',
      'Anonymous: Create account',
      'Anonymous: Verify email if required',
      'Anonymous: Land in app',
      'Anonymous: Complete first meaningful action',
      'Anonymous: Upgrade if applicable',
      'Anonymous: Log out',
      'Anonymous: Log back in',
      'Returning: Log in',
      'Returning: View saved data',
      'Returning: Edit data',
      'Returning: Use key feature',
      'Returning: Search/filter data',
      'Returning: Upgrade/downgrade if applicable',
      'Returning: Logout',
      'Paid: Subscribe',
      'Paid: Gain paid access',
      'Paid: Use locked feature',
      'Paid: Refresh app',
      'Paid: Log out and log back in',
      'Paid: Still has paid access',
      'Failure: Enter wrong password',
      'Failure: Use invalid input',
      'Failure: Cancel checkout',
      'Failure: Lose internet mid-action',
      'Failure: Hit protected route while logged out',
      'Failure: Trigger no-results state',
    ]
  },
  {
    id: 'admin', title: '26. Admin / Owner / Internal Control Checks', items: [
      'Admin panel works if used',
      'Admin-only actions are protected',
      'Internal dashboards show correct counts',
      'User management works if included',
      'Subscription statuses visible internally if needed',
      'Support tools work',
      'Feature toggles work',
      'Internal logs readable',
      'Error reports accessible',
      'Manual override processes known if something breaks on launch day',
    ]
  },
  {
    id: 'launch', title: '27. Launch-Day Readiness', items: [
      'Final production deploy completed',
      'Final smoke test passed',
      'Payment live mode confirmed',
      'Domain confirmed',
      'SSL confirmed',
      'Support email active',
      'Contact form active',
      'Backup of previous version exists',
      'Rollback plan exists',
      'Team knows current live version',
      'Announcements/social posts ready',
      'Screenshots/videos match current product',
      'Pricing pages match offer',
      'No unfinished "coming soon" sections unless intentional',
      'First-time onboarding is polished enough to be seen publicly',
    ]
  },
  {
    id: 'brutal', title: '🔥 Brutal "Don\'t Be Lazy" Test', items: [
      'Can I open it?',
      'Can I close it?',
      'Can I tap it?',
      'Can I scroll it?',
      'Can I submit it?',
      'Can I break it with bad input?',
      'Can I use it on mobile?',
      'Can I use it logged out?',
      'Can I use it logged in?',
      'Can I use it as a paid user?',
      'Can I use it as a non-paid user?',
      'Does it survive refresh?',
      'Does it survive slow internet?',
      'Does it survive wrong input?',
      'Does it look good?',
      'Does it make sense instantly?',
      'Does it save correct data?',
      'Does it show correct feedback?',
      'Does it fail gracefully?',
    ]
  },
  {
    id: 'missed', title: '⚠️ Most Commonly Missed', items: [
      'Broken mobile layout on one weird screen size',
      'Tap target too small on mobile',
      'Keyboard covers submit button',
      'Wrong Stripe price ID connected',
      'Trial copy says one thing, billing does another',
      'Webhook not updating user access',
      'Login works but redirect breaks',
      'Logout works but stale state remains',
      'Button looks clickable but does nothing',
      'Form submits twice',
      'Saved record doesn\'t appear until refresh',
      'Deleted record still shows due to cache',
      'User sees another user\'s data',
      'Console full of red errors but app "sorta works"',
      'One broken env var kills live app',
      'Test mode still active in production',
      'Support email wrong',
      'Broken password reset link',
      'Social preview ugly or wrong',
      'One feature works only on desktop because hover was relied on',
      'Modal can\'t close on mobile',
      'Long text destroys card layout',
      'Empty state looks like app is broken',
      'Slow API makes users think button didn\'t work',
      'No loading state, no success state, no error state',
      'App was only tested by builder who already knows where everything is',
    ]
  },
  {
    id: 'signoff', title: '✅ Final Pre-Launch Sign-Off', items: [
      'A brand-new user can understand what the app does fast',
      'A brand-new user can sign up without confusion',
      'A brand-new user can complete the main action without help',
      'A paying user gets what they paid for',
      'A non-paying user understands limits without feeling scammed',
      'Mobile experience is solid',
      'Core feature works repeatedly',
      'Backend saves correct data',
      'Frontend reflects correct data',
      'Billing is accurate',
      'Errors are survivable',
      'App looks finished',
      'Nothing mission-critical is still "I\'ll fix that later"',
    ]
  },
];

const STORAGE_KEY = 'pre_launch_checklist_v1';

function ChecklistContent() {
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
  });
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  const resetAll = () => { if (confirm('Reset all checklist progress?')) setChecked({}); };

  const totalItems = useMemo(() => CHECKLIST.reduce((s, c) => s + c.items.length, 0), []);
  const totalChecked = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const overallPct = Math.round((totalChecked / totalItems) * 100);

  return (
    <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Settings')}>
            <Button variant="ghost" className="text-blue-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={resetAll} className="text-red-400 border-red-900/40 hover:bg-red-950/30">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset All
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Master Pre-Launch Checklist</h1>
          <p className="text-blue-400">Check off every item before going live.</p>
        </div>

        {/* Overall Progress */}
        <Card className="bg-[#0f1419] border-blue-900/30 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-200 font-medium">Overall Progress</span>
              <span className="text-2xl font-bold text-white">{totalChecked}/{totalItems} <span className="text-lg text-blue-400">({overallPct}%)</span></span>
            </div>
            <Progress value={overallPct} className="h-3" />
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="space-y-4">
          {CHECKLIST.map((cat) => {
            const catChecked = cat.items.filter((item) => checked[`${cat.id}::${item}`]).length;
            const catPct = Math.round((catChecked / cat.items.length) * 100);
            const isCollapsed = collapsed[cat.id];
            const allDone = catChecked === cat.items.length;

            return (
              <Card key={cat.id} className={`bg-[#0f1419] border-blue-900/30 transition-colors ${allDone ? 'border-green-900/40' : ''}`}>
                <button
                  onClick={() => toggleCollapse(cat.id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isCollapsed ? <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    <span className="font-semibold text-white truncate">{cat.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-2 w-24">
                      <Progress value={catPct} className="h-1.5 flex-1" />
                    </div>
                    <Badge className={allDone ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-blue-900/30 text-blue-300 border-blue-800'}>
                      {catChecked}/{cat.items.length}
                    </Badge>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="px-6 pb-4 space-y-1.5">
                    {cat.items.map((item) => {
                      const key = `${cat.id}::${item}`;
                      const isDone = !!checked[key];
                      return (
                        <button
                          key={item}
                          onClick={() => toggle(key)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors
                            ${isDone ? 'bg-green-950/20' : 'hover:bg-blue-950/20'}`}
                        >
                          {isDone
                            ? <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            : <Square className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                          <span className={`text-sm leading-snug ${isDone ? 'line-through text-blue-600' : 'text-blue-100'}`}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="h-16" />
      </div>
    </div>
  );
}

export default function ProductionChecklist() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <ChecklistContent />
    </RoleGuard>
  );
}