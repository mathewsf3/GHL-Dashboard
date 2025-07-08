'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Tag,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Sparkles,
  ChevronRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  Star,
  Activity,
  Building,
  Target,
  CreditCard,
  Wallet,
  Timer,
  Link2,
  Hash,
  Globe,
  MousePointer,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateAdded: string;
  tags: string[];
  customFields?: {
    applicationDate?: string;
    utmContent?: string;
    capitalAvailable?: string;
    creditScore?: string;
  };
}

interface ContactDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateAdded: string;
  dateUpdated: string;
  source?: string;
  tags: string[];
  customFields: Array<{
    id: string;
    name: string;
    value: any;
    displayValue: string;
  }>;
  campaignData?: {
    adId: string;
    adName: string;
    adSetId: string;
    adSetName: string;
    campaignId: string;
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    reach: number;
    frequency: number;
    matchMethod: string;
  };
  journey: {
    application: boolean;
    applicationDate?: string;
    mql: boolean;
    mqlReason?: string;
    callBooked: boolean;
    callBookedDate?: string;
    introTaken: boolean;
    introTakenDate?: string;
    contractSent: boolean;
    contractSentDate?: string;
    contractUrl?: string;
    dealWon: boolean;
    dealWonDate?: string;
    dealValue?: string;
  };
  activities: Array<{
    type: string;
    date: string;
    description: string;
  }>;
}

export default function LeadFinderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch(`/api/lead-finder/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Search failed');
        }

        setSearchResults(data.contacts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  // Load contact details
  const loadContactDetails = async (contactId: string) => {
    setIsLoadingDetails(true);
    setError(null);

    try {
      const response = await fetch(`/api/lead-finder/details?id=${contactId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load details');
      }

      setSelectedContact(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Get journey step icon
  const getJourneyIcon = (step: string, completed: boolean) => {
    const iconClass = cn("h-5 w-5", completed ? "text-green-500" : "text-slate-400");
    
    switch (step) {
      case 'application':
        return <FileText className={iconClass} />;
      case 'mql':
        return <Star className={iconClass} />;
      case 'callBooked':
        return <Phone className={iconClass} />;
      case 'introTaken':
        return <User className={iconClass} />;
      case 'contractSent':
        return <FileText className={iconClass} />;
      case 'dealWon':
        return <DollarSign className={iconClass} />;
      default:
        return <CheckCircle className={iconClass} />;
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact_created':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'application':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'qualification':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'disqualified':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'call_booked':
        return <Phone className="h-4 w-4 text-purple-500" />;
      case 'intro_taken':
        return <User className="h-4 w-4 text-green-500" />;
      case 'contract_sent':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'deal_won':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'campaign_matched':
        return <TrendingUp className="h-4 w-4 text-indigo-500" />;
      case 'no_show':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'priority':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'nurture':
        return <Clock className="h-4 w-4 text-cyan-500" />;
      case 'field_update':
        return <Activity className="h-4 w-4 text-slate-400" />;
      default:
        return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  // Get field icon
  const getFieldIcon = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    if (name.includes('capital')) return <Wallet className="h-4 w-4" />;
    if (name.includes('credit')) return <CreditCard className="h-4 w-4" />;
    if (name.includes('income')) return <DollarSign className="h-4 w-4" />;
    if (name.includes('utm')) return <Link2 className="h-4 w-4" />;
    if (name.includes('campaign')) return <Target className="h-4 w-4" />;
    if (name.includes('ad')) return <MousePointer className="h-4 w-4" />;
    if (name.includes('timeline')) return <Timer className="h-4 w-4" />;
    if (name.includes('ip')) return <Globe className="h-4 w-4" />;
    if (name.includes('date')) return <Calendar className="h-4 w-4" />;
    if (name.includes('type')) return <Tag className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
            <Search className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Lead Finder
          </h1>
        </div>
        <p className="text-slate-400 text-lg">Search and view comprehensive information about any lead</p>
      </div>

      {/* Search Section */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-lg"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-400">
                    Found {searchResults.length} lead{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  <Badge variant="secondary" className="bg-slate-700/50">
                    {searchResults.filter(r => r.customFields?.applicationDate).length} Applications
                  </Badge>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {searchResults.map((result) => {
                    // Determine MQL status
                    const hasApplication = result.customFields?.applicationDate;
                    const isQualifiedCapital = result.customFields?.capitalAvailable !== 'Less than $1k';
                    const isQualifiedCredit = result.customFields?.creditScore !== 'Less than 680';
                    const isMQL = hasApplication && isQualifiedCapital && isQualifiedCredit;
                    
                    // Determine journey stage
                    const hasCallBooked = result.tags.some(tag => 
                      tag.toLowerCase().includes('booked') || 
                      tag.toLowerCase().includes('scheduled')
                    );
                    const hasContract = result.tags.some(tag => 
                      tag.toLowerCase().includes('contract')
                    );
                    const hasWon = result.tags.some(tag => 
                      tag.toLowerCase().includes('won') || 
                      tag.toLowerCase().includes('closed')
                    );
                    
                    return (
                      <motion.div
                        key={result.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-0 h-auto bg-slate-900/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-purple-500/30 overflow-hidden group"
                          onClick={() => loadContactDetails(result.id)}
                        >
                          <div className="flex items-stretch w-full">
                            {/* Status Indicator Bar */}
                            <div className={cn(
                              "w-1.5 shrink-0 transition-all duration-300",
                              hasWon ? "bg-gradient-to-b from-emerald-500 to-emerald-600" :
                              hasContract ? "bg-gradient-to-b from-orange-500 to-orange-600" :
                              hasCallBooked ? "bg-gradient-to-b from-purple-500 to-purple-600" :
                              isMQL ? "bg-gradient-to-b from-yellow-500 to-yellow-600" :
                              hasApplication ? "bg-gradient-to-b from-blue-500 to-blue-600" :
                              "bg-gradient-to-b from-slate-600 to-slate-700"
                            )} />
                            
                            {/* Main Content */}
                            <div className="flex items-center gap-4 w-full p-4">
                              {/* Avatar */}
                              <div className="relative">
                                <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-300">
                                  <User className="h-5 w-5 text-purple-400" />
                                </div>
                                {isMQL && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full ring-2 ring-slate-800" />
                                )}
                              </div>
                              
                              {/* Lead Info */}
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-3">
                                  <p className="font-semibold text-white">
                                    {result.firstName || 'Unknown'} {result.lastName || ''}
                                  </p>
                                  {/* Quick Status Badges */}
                                  {hasWon && (
                                    <Badge className="text-xs bg-emerald-700/30 text-emerald-300 border-emerald-600/30">Won</Badge>
                                  )}
                                  {isMQL && !hasWon && (
                                    <Badge className="text-xs bg-yellow-700/30 text-yellow-300 border-yellow-600/30">MQL</Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                  {result.email && (
                                    <span className="flex items-center gap-1.5">
                                      <Mail className="h-3.5 w-3.5" />
                                      <span className="truncate max-w-[200px]">{result.email}</span>
                                    </span>
                                  )}
                                  {result.phone && (
                                    <span className="flex items-center gap-1.5">
                                      <Phone className="h-3.5 w-3.5" />
                                      {result.phone}
                                    </span>
                                  )}
                                </div>
                                
                                {/* UTM/Campaign Info if available */}
                                {result.customFields?.utmContent && result.customFields.utmContent !== 'No UTMs' && (
                                  <div className="mt-2">
                                    <p className="text-xs text-purple-400 truncate" title={result.customFields.utmContent}>
                                      <Target className="h-3 w-3 inline mr-1" />
                                      {(() => {
                                        // Extract campaign name from structured UTM
                                        const parts = result.customFields.utmContent.split(' | ');
                                        return parts[3] || result.customFields.utmContent.substring(0, 50) + '...';
                                      })()}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Journey Progress Mini Indicator */}
                              <div className="flex items-center gap-1">
                                {[
                                  { done: hasApplication, color: 'bg-blue-500' },
                                  { done: isMQL, color: 'bg-yellow-500' },
                                  { done: hasCallBooked, color: 'bg-purple-500' },
                                  { done: hasContract, color: 'bg-orange-500' },
                                  { done: hasWon, color: 'bg-emerald-500' }
                                ].map((step, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                      step.done ? step.color : "bg-slate-700"
                                    )}
                                  />
                                ))}
                              </div>
                              
                              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                            </div>
                          </div>
                        </Button>
                        {/* Temporary Debug Section for UTM Fields */}
            {selectedContact && (
              <Card className="bg-red-900/20 border-red-700/50">
                <CardHeader>
                  <CardTitle className="text-red-400 text-sm">Debug: All Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs font-mono">
                    {selectedContact.customFields
                      .filter(f => f.value)
                      .map((field, idx) => (
                        <div key={idx} className="p-2 bg-slate-900/50 rounded border border-slate-700/50">
                          <div className="text-green-400">Field #{idx + 1}</div>
                          <div className="text-blue-400">ID: {field.id}</div>
                          <div className="text-yellow-400">Name: {field.name || 'NO NAME'}</div>
                          {field.rawField && (
                            <div className="text-purple-400">Key: {field.rawField.key || 'NO KEY'}</div>
                          )}
                          <div className="text-white mt-1">Value: {field.value?.substring(0, 100)}{field.value?.length > 100 ? '...' : ''}</div>
                          {field.value?.includes(' | ') && (
                            <div className="text-orange-400 mt-1">⚠️ Looks like UTM data!</div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Temporary Debug Section for UTM Fields */}
            {selectedContact && (
              <Card className="bg-red-900/20 border-red-700/50">
                <CardHeader>
                  <CardTitle className="text-red-400 text-sm">Debug: All Custom Fields for {selectedContact?.firstName || 'Unknown'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs font-mono max-h-96 overflow-y-auto">
                    {selectedContact.customFields
                      .filter(f => f.value)
                      .map((field, idx) => (
                        <div key={idx} className="p-2 bg-slate-900/50 rounded border border-slate-700/50">
                          <div className="text-green-400">Field #{idx + 1}</div>
                          <div className="text-blue-400">ID: {field.id}</div>
                          <div className="text-yellow-400">Name: {field.name || 'NO NAME'}</div>
                          {field.rawField && (
                            <div className="text-purple-400">Key: {field.rawField.key || 'NO KEY'}</div>
                          )}
                          <div className="text-white mt-1">Value: {field.value?.substring(0, 200)}{field.value?.length > 200 ? '...' : ''}</div>
                          {field.value?.includes(' | ') && (
                            <div className="text-orange-400 mt-1">⚠️ Looks like UTM data!</div>
                          )}
                        </div>
                      ))}}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Temporary Debug Section for UTM Fields */}
            <Card className="bg-red-900/20 border-red-700/50">
              <CardHeader>
                <CardTitle className="text-red-400 text-sm">Debug: All Custom Fields for {selectedContact?.firstName || 'Unknown'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono max-h-96 overflow-y-auto">
                  {selectedContact.customFields
                    .filter(f => f.value)
                    .map((field, idx) => (
                      <div key={idx} className="p-2 bg-slate-900/50 rounded border border-slate-700/50">
                        <div className="text-green-400">Field #{idx + 1}</div>
                        <div className="text-blue-400">ID: {field.id}</div>
                        <div className="text-yellow-400">Name: {field.name || 'NO NAME'}</div>
                        {field.rawField && (
                          <div className="text-purple-400">Key: {field.rawField.key || 'NO KEY'}</div>
                        )}
                        <div className="text-white mt-1">Value: {field.value?.substring(0, 200)}{field.value?.length > 200 ? '...' : ''}</div>
                        {field.value?.includes(' | ') && (
                          <div className="text-orange-400 mt-1">⚠️ Looks like UTM data!</div>
                        )}
                      </div>
                    ))}
                  {selectedContact.customFields.filter(f => f.value).length === 0 && (
                    <div className="text-slate-500">No custom fields with values found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No leads found matching "{searchQuery}"</p>
                <p className="text-sm text-slate-500 mt-1">Try searching with a different name or email</p>
              </motion.div>
            )}

            {searchQuery.length < 2 && !isSearching && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <div className="text-center py-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-purple-600/20 blur-3xl" />
                    <Search className="h-16 w-16 text-purple-400 mx-auto mb-4 relative" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Search for any lead</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Find detailed information about any contact in your GHL system by searching their name, email, or phone number.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Enhanced Loading State */}
      <AnimatePresence mode="wait">
        {isLoadingDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
                </div>
                
                <CardContent className="relative p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="h-8 bg-slate-700/50 rounded-lg w-64 mb-3 animate-pulse" />
                      <div className="h-5 bg-slate-700/50 rounded-lg w-96 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-5 bg-slate-700/50 rounded w-3/4 mb-4" />
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-700/50 rounded w-full" />
                        <div className="h-4 bg-slate-700/50 rounded w-5/6" />
                        <div className="h-4 bg-slate-700/50 rounded w-4/6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-3 text-purple-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <p className="text-sm font-medium">Loading lead details...</p>
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Lead Details - All in One View */}
        {selectedContact && !isLoadingDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Contact Header Card */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm overflow-hidden">
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
                </div>
                
                <CardContent className="relative p-8">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Contact Info - Removed the avatar/person icon section */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start gap-4 mb-4">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-1">
                            {selectedContact.firstName || 'Unknown'} {selectedContact.lastName || ''}
                          </h2>
                          <div className="flex flex-wrap items-center gap-4 text-slate-300">
                            {selectedContact.email && (
                              <span className="flex items-center gap-1.5">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {selectedContact.email}
                              </span>
                            )}
                            {selectedContact.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {selectedContact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {selectedContact.journey.dealWon && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm px-3 py-1">
                              <DollarSign className="h-3.5 w-3.5 mr-1" />
                              Deal Won
                            </Badge>
                          )}
                          {selectedContact.journey.mql && !selectedContact.journey.dealWon && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-sm px-3 py-1">
                              <Star className="h-3.5 w-3.5 mr-1" />
                              MQL
                            </Badge>
                          )}
                          {selectedContact.campaignData && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm px-3 py-1">
                              <TrendingUp className="h-3.5 w-3.5 mr-1" />
                              Tracked
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Key Stats - Only show if we have campaign data or deal value */}
                      {(selectedContact.campaignData || selectedContact.journey.dealValue) && (
                        <div className="grid grid-cols-2 gap-4">
                          {selectedContact.campaignData && (
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                              <p className="text-xs text-slate-400 mb-1">Ad Spend</p>
                              <p className="text-lg font-semibold text-white">
                                ${selectedContact.campaignData.spend.toFixed(0)}
                              </p>
                            </div>
                          )}
                          {selectedContact.journey.dealValue && (
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                              <p className="text-xs text-slate-400 mb-1">Deal Value</p>
                              <p className="text-lg font-semibold text-emerald-400">
                                {selectedContact.journey.dealValue}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* All Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Journey Card */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-400" />
                      Customer Journey
                    </span>
                    <span className="text-sm text-slate-400 font-normal">
                      {(() => {
                        const steps = ['application', 'mql', 'callBooked', 'introTaken', 'contractSent', 'dealWon'];
                        const completed = steps.filter(s => selectedContact.journey[s as keyof typeof selectedContact.journey]);
                        return `${completed.length}/6 steps`;
                      })()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { key: 'application', label: 'Application', icon: FileText, date: selectedContact.journey.applicationDate },
                      { key: 'mql', label: 'MQL Status', icon: Star, reason: selectedContact.journey.mqlReason },
                      { key: 'callBooked', label: 'Call Booked', icon: Phone, date: selectedContact.journey.callBookedDate },
                      { key: 'introTaken', label: 'Intro Taken', icon: User, date: selectedContact.journey.introTakenDate },
                      { key: 'contractSent', label: 'Contract Sent', icon: FileText, date: selectedContact.journey.contractSentDate },
                      { key: 'dealWon', label: 'Deal Won', icon: DollarSign, date: selectedContact.journey.dealWonDate, value: selectedContact.journey.dealValue }
                    ].map((step, idx) => {
                      const completed = selectedContact.journey[step.key as keyof typeof selectedContact.journey] as boolean;
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.key} className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            completed 
                              ? "bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-600/30" 
                              : "bg-slate-800 border border-slate-700"
                          )}>
                            <Icon className={cn(
                              "h-4 w-4",
                              completed ? "text-purple-400" : "text-slate-500"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "font-medium",
                                completed ? "text-white" : "text-slate-500"
                              )}>
                                {step.label}
                              </p>
                              {completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                            {step.date && (
                              <p className="text-sm text-slate-400 mt-0.5">{step.date}</p>
                            )}
                            {step.reason && !completed && (
                              <p className="text-sm text-red-400 mt-0.5">{step.reason}</p>
                            )}
                            {step.value && (
                              <p className="text-sm text-emerald-400 font-medium mt-0.5">{step.value}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedContact.journey.contractUrl && (
                    <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                      <a
                        href={selectedContact.journey.contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-medium text-purple-300">Contract Document</p>
                          <p className="text-xs text-slate-400 mt-0.5">Click to view in PandaDoc</p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Custom Fields */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Lead Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Group fields by category */}
                    <div>
                      <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Qualification Info
                      </h4>
                      <div className="space-y-2">
                        {selectedContact.customFields
                          .filter(f => ['Capital Available', 'Credit Score', 'Annual Income', 'Ever Gone Through Persona', 'Funding Timeline'].includes(f.name))
                          .map(field => {
                            const isDisqualifying = 
                              (field.name === 'Capital Available' && field.value === 'Less than $1k') ||
                              (field.name === 'Credit Score' && field.value === 'Less than 680');
                            
                            return (
                              <div key={field.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-900/30 transition-colors">
                                <span className="flex items-center gap-2 text-sm text-slate-400">
                                  {getFieldIcon(field.name)}
                                  {field.name}
                                </span>
                                <span className={cn(
                                  "text-sm font-medium",
                                  isDisqualifying ? "text-red-400" : "text-white"
                                )}>
                                  {field.displayValue || '-'}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Campaign Tracking
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          // Find UTM Content field using multiple approaches
                          let utmContentField = null;
                          
                          // Method 1: Check known field ID
                          utmContentField = selectedContact.customFields.find(f => 
                            f.id === 'dydJfZGjUkyTmGm4OIef' && f.value && f.value !== 'No UTMs'
                          );
                          
                          // Method 2: Check by field name containing 'utm' and 'content'
                          if (!utmContentField) {
                            utmContentField = selectedContact.customFields.find(f => 
                              f.value && 
                              f.name?.toLowerCase().includes('utm') && 
                              f.name?.toLowerCase().includes('content') &&
                              f.value !== 'No UTMs'
                            );
                          }
                          
                          // Method 3: Check for structured UTM format (pipe-delimited)
                          if (!utmContentField) {
                            utmContentField = selectedContact.customFields.find(f => 
                              f.value && 
                              f.value.includes(' | ') && 
                              f.value.split(' | ').length >= 3
                            );
                          }
                          
                          // Method 4: Check raw field key
                          if (!utmContentField) {
                            utmContentField = selectedContact.customFields.find(f => 
                              f.value && (
                                f.rawField?.key === 'utm_content' || 
                                f.rawField?.key === 'contact.utm_content' ||
                                f.rawField?.key?.toLowerCase().includes('utm_content') ||
                                f.name === 'utm_content' // Also check if name is exactly utm_content
                              )
                            );
                          }
                          
                          if (utmContentField) {
                            // Parse the structured UTM content
                            const parts = utmContentField.value.split(' | ');
                            const campaignInfo = {
                              campaignCode: parts[0] || '',
                              adId: parts[1] || '',
                              version: parts[2] || '',
                              campaignName: parts[3] || '',
                              adCopy: parts[4] || '',
                              contentCode: parts[5] || '',
                              headlineCode: parts[6] || '',
                              metaId: parts[7] || ''
                            };
                            
                            return (
                              <div className="space-y-3">
                                {/* Campaign Overview */}
                                <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-blue-400 mb-1">Campaign</p>
                                      <p className="text-sm text-white font-medium">{campaignInfo.campaignName}</p>
                                    </div>
                                    {campaignInfo.adCopy && (
                                      <div>
                                        <p className="text-xs text-blue-400 mb-1">Ad Copy</p>
                                        <p className="text-sm text-white">{campaignInfo.adCopy}</p>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                      <div>
                                        <p className="text-xs text-slate-500">Ad ID</p>
                                        <p className="text-xs text-white font-mono">{campaignInfo.adId}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Meta ID</p>
                                        <p className="text-xs text-white font-mono">{campaignInfo.metaId}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Raw UTM Content */}
                                <div className="py-1.5 px-3 rounded-lg bg-slate-900/30">
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                    {getFieldIcon('UTM Content')}
                                    Full UTM Content
                                  </div>
                                  <p className="text-xs text-slate-300 font-mono break-all" title={utmContentField.value}>
                                    {utmContentField.value}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          
                          // Show other tracking fields
                          const otherTrackingFields = selectedContact.customFields
                            .filter(f => {
                              const nameLower = f.name.toLowerCase();
                              return f.value && (
                                (nameLower.includes('utm') && f.id !== 'dydJfZGjUkyTmGm4OIef') || 
                                nameLower.includes('campaign') || 
                                nameLower.includes('ad set') ||
                                nameLower.includes('source') ||
                                nameLower.includes('fbclid') ||
                                nameLower.includes('gclid') ||
                                f.id === 'phPaAW2mN1KrjtQuSSew' // Ad Set ID field
                              );
                            });
                          
                          if (otherTrackingFields.length > 0) {
                            return (
                              <div className="space-y-2">
                                {!utmContentField && (
                                  <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-700/30 mb-3">
                                    <p className="text-xs text-amber-400 flex items-center gap-2">
                                      <AlertCircle className="h-3.5 w-3.5" />
                                      No structured campaign data found
                                    </p>
                                  </div>
                                )}
                                {otherTrackingFields.map(field => (
                                  <div key={field.id} className="py-1.5 px-3 rounded-lg hover:bg-slate-900/30 transition-colors">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                      {getFieldIcon(field.name)}
                                      {field.name}
                                    </div>
                                    <p className="text-sm text-white font-mono" title={field.value}>
                                      {field.value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          
                          // No tracking data at all
                          return (
                            <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              <p className="text-xs text-slate-500 flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5" />
                                No campaign tracking data available
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-green-300 mb-3 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Other Information
                      </h4>
                      <div className="space-y-2">
                        {selectedContact.customFields
                          .filter(f => !['Capital Available', 'Credit Score', 'Annual Income', 'Ever Gone Through Persona', 'Funding Timeline'].includes(f.name) &&
                                      !f.name.toLowerCase().includes('utm') && !f.name.toLowerCase().includes('campaign') && !f.name.toLowerCase().includes('ad'))
                          .slice(0, 5)
                          .map(field => (
                            <div key={field.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-900/30 transition-colors">
                              <span className="flex items-center gap-2 text-sm text-slate-400">
                                {getFieldIcon(field.name)}
                                {field.name}
                              </span>
                              <span className="text-sm text-white">
                                {field.displayValue || '-'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign & Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Performance */}
              {selectedContact.campaignData && (
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                      Campaign Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-2">Campaign Hierarchy</p>
                        <div className="space-y-1">
                          <p className="text-white font-medium flex items-center gap-2">
                            <Building className="h-4 w-4 text-slate-500" />
                            {selectedContact.campaignData.campaignName}
                          </p>
                          <p className="text-sm text-slate-400 pl-6">↳ {selectedContact.campaignData.adSetName}</p>
                          <p className="text-sm text-slate-500 pl-6">↳ {selectedContact.campaignData.adName}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-2xl font-bold text-white">${selectedContact.campaignData.spend.toFixed(0)}</p>
                          <p className="text-xs text-slate-400">Spend</p>
                        </div>
                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-2xl font-bold text-white">{selectedContact.campaignData.clicks}</p>
                          <p className="text-xs text-slate-400">Clicks</p>
                        </div>
                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-2xl font-bold text-white">{selectedContact.campaignData.ctr.toFixed(2)}%</p>
                          <p className="text-xs text-slate-400">CTR</p>
                        </div>
                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-2xl font-bold text-white">${selectedContact.campaignData.cpc.toFixed(2)}</p>
                          <p className="text-xs text-slate-400">CPC</p>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-700/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Impressions</span>
                          <span className="text-white font-medium">{selectedContact.campaignData.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-slate-400">Reach</span>
                          <span className="text-white font-medium">{selectedContact.campaignData.reach.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-slate-400">Frequency</span>
                          <span className="text-white font-medium">{selectedContact.campaignData.frequency.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity Timeline */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-400" />
                      Activity Timeline
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedContact.activities.length} events
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {selectedContact.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 group">
                        <div className="p-2 bg-slate-800 rounded-lg shrink-0 group-hover:bg-slate-700/50 transition-colors">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">
                            {activity.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(activity.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags Section */}
            {selectedContact.tags.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-400" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.tags.map((tag, idx) => {
                      const tagLower = tag.toLowerCase();
                      let badgeClass = "bg-slate-700/50 text-slate-300 border-slate-600/50";
                      
                      if (tagLower.includes('booked')) badgeClass = "bg-purple-700/30 text-purple-300 border-purple-600/30";
                      else if (tagLower.includes('mql')) badgeClass = "bg-yellow-700/30 text-yellow-300 border-yellow-600/30";
                      else if (tagLower.includes('won')) badgeClass = "bg-emerald-700/30 text-emerald-300 border-emerald-600/30";
                      else if (tagLower.includes('no show')) badgeClass = "bg-red-700/30 text-red-300 border-red-600/30";
                      else if (tagLower.includes('contract')) badgeClass = "bg-orange-700/30 text-orange-300 border-orange-600/30";
                      else if (tagLower.includes('hot') || tagLower.includes('priority')) badgeClass = "bg-amber-700/30 text-amber-300 border-amber-600/30";
                      else if (tagLower.includes('nurture')) badgeClass = "bg-cyan-700/30 text-cyan-300 border-cyan-600/30";
                      
                      return (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className={cn("border", badgeClass)}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}