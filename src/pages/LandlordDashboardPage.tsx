import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Home, ArrowLeft, Eye, CalendarCheck, Wallet, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface Hostel {
  id: string;
  name: string;
  location: string;
  address: string;
  price: number;
  hostel_type: string;
  description: string;
  facilities: string[];
  rules: string[];
  images: string[];
  caretaker_name: string;
  caretaker_phone: string;
  available_rooms: number;
  is_verified: boolean;
}

interface BookingRow {
  id: string;
  hostel_id: string;
  hostel_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface ViewRow {
  hostel_id: string;
}

const emptyHostel = {
  name: '',
  location: '',
  address: '',
  price: 0,
  hostel_type: 'self-contain',
  description: '',
  facilities: [] as string[],
  rules: [] as string[],
  images: [] as string[],
  caretaker_name: '',
  caretaker_phone: '',
  available_rooms: 0,
  is_verified: false,
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));

export default function LandlordDashboardPage() {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [views, setViews] = useState<ViewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const [formData, setFormData] = useState(emptyHostel);
  const [facilitiesInput, setFacilitiesInput] = useState('');
  const [rulesInput, setRulesInput] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hostelsRes, bookingsRes, viewsRes] = await Promise.all([
        supabase.from('hostels').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('id, hostel_id, hostel_name, amount, status, created_at').order('created_at', { ascending: false }),
        supabase.from('hostel_views').select('hostel_id'),
      ]);
      setHostels(hostelsRes.data || []);
      setBookings(bookingsRes.data || []);
      setViews(viewsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Analytics aggregates
  const totalViews = views.length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalBookings = confirmedBookings.length;
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  const perHostel = hostels.map((h) => {
    const hViews = views.filter((v) => v.hostel_id === h.id).length;
    const hBookings = confirmedBookings.filter((b) => b.hostel_id === h.id);
    return {
      hostel: h,
      views: hViews,
      bookings: hBookings.length,
      revenue: hBookings.reduce((s, b) => s + (b.amount || 0), 0),
    };
  });

  // CRUD
  const openCreateDialog = () => {
    setEditingHostel(null);
    setFormData(emptyHostel);
    setFacilitiesInput('');
    setRulesInput('');
    setImagesInput('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (hostel: Hostel) => {
    setEditingHostel(hostel);
    setFormData({
      name: hostel.name,
      location: hostel.location,
      address: hostel.address,
      price: hostel.price,
      hostel_type: hostel.hostel_type,
      description: hostel.description,
      facilities: hostel.facilities || [],
      rules: hostel.rules || [],
      images: hostel.images || [],
      caretaker_name: hostel.caretaker_name,
      caretaker_phone: hostel.caretaker_phone,
      available_rooms: hostel.available_rooms || 0,
      is_verified: hostel.is_verified || false,
    });
    setFacilitiesInput((hostel.facilities || []).join(', '));
    setRulesInput((hostel.rules || []).join(', '));
    setImagesInput((hostel.images || []).join('\n'));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.location || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const hostelData = {
        ...formData,
        facilities: facilitiesInput.split(',').map((f) => f.trim()).filter(Boolean),
        rules: rulesInput.split(',').map((r) => r.trim()).filter(Boolean),
        images: imagesInput.split('\n').map((i) => i.trim()).filter(Boolean),
      };
      if (editingHostel) {
        const { error } = await supabase.from('hostels').update(hostelData).eq('id', editingHostel.id);
        if (error) throw error;
        toast.success('Hostel updated');
      } else {
        const { error } = await supabase.from('hostels').insert([hostelData]);
        if (error) throw error;
        toast.success('Hostel created');
      }
      setIsDialogOpen(false);
      fetchAll();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save hostel');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hostel? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('hostels').delete().eq('id', id);
      if (error) throw error;
      toast.success('Hostel deleted');
      fetchAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete hostel');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-muted-foreground hover:text-foreground mb-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your listings and track performance</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Hostel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingHostel ? 'Edit Hostel' : 'Add New Hostel'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Hostel name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hostel_type">Type *</Label>
                    <Select value={formData.hostel_type} onValueChange={(value) => setFormData({ ...formData, hostel_type: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self-contain">Self Contain</SelectItem>
                        <SelectItem value="single-room">Single Room</SelectItem>
                        <SelectItem value="shared">Shared Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Ekosodin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₦/year) *</Label>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} placeholder="150000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full street address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caretaker_name">Caretaker Name</Label>
                    <Input id="caretaker_name" value={formData.caretaker_name} onChange={(e) => setFormData({ ...formData, caretaker_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caretaker_phone">Caretaker Phone</Label>
                    <Input id="caretaker_phone" value={formData.caretaker_phone} onChange={(e) => setFormData({ ...formData, caretaker_phone: e.target.value })} placeholder="08012345678" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="available_rooms">Available Rooms</Label>
                    <Input id="available_rooms" type="number" value={formData.available_rooms} onChange={(e) => setFormData({ ...formData, available_rooms: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="flex items-center space-x-2 pt-7">
                    <Switch id="is_verified" checked={formData.is_verified} onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })} />
                    <Label htmlFor="is_verified">Verified Listing</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilities">Facilities (comma separated)</Label>
                  <Input id="facilities" value={facilitiesInput} onChange={(e) => setFacilitiesInput(e.target.value)} placeholder="WiFi, Water, Security, Generator" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rules">Rules (comma separated)</Label>
                  <Input id="rules" value={rulesInput} onChange={(e) => setRulesInput(e.target.value)} placeholder="No pets, Quiet hours after 10pm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">Image URLs (one per line)</Label>
                  <Textarea id="images" value={imagesInput} onChange={(e) => setImagesInput(e.target.value)} placeholder="https://example.com/image1.jpg" rows={3} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : editingHostel ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Analytics summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10"><Home className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Listings</p>
                  <p className="text-2xl font-bold">{hostels.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10"><Eye className="h-5 w-5 text-blue-500" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-500/10"><CalendarCheck className="h-5 w-5 text-green-500" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <p className="text-2xl font-bold">{totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-500/10"><Wallet className="h-5 w-5 text-orange-500" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue (fees)</p>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Per-hostel performance */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Per-listing performance</h2>
            </div>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : perHostel.length === 0 ? (
              <p className="text-muted-foreground text-sm">No listings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Hostel</th>
                      <th className="py-2 px-4 font-medium">Views</th>
                      <th className="py-2 px-4 font-medium">Bookings</th>
                      <th className="py-2 px-4 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perHostel.map(({ hostel, views, bookings, revenue }) => (
                      <tr key={hostel.id} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{hostel.name}</td>
                        <td className="py-2.5 px-4">{views}</td>
                        <td className="py-2.5 px-4">{bookings}</td>
                        <td className="py-2.5 px-4">{formatPrice(revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listings */}
        <h2 className="text-lg font-semibold mb-3">Your listings</h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : hostels.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hostels yet</h3>
              <p className="text-muted-foreground mb-4">Add your first hostel listing to get started.</p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Hostel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {hostels.map((hostel) => (
              <Card key={hostel.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {hostel.images?.[0] ? (
                          <img src={hostel.images[0]} alt={hostel.name} className="w-full h-full object-cover" />
                        ) : (
                          <Home className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{hostel.name}</h3>
                          {hostel.is_verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{hostel.location} • {hostel.hostel_type}</p>
                        <p className="text-sm font-medium text-primary">{formatPrice(hostel.price)}/year</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(hostel)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(hostel.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent bookings */}
        <h2 className="text-lg font-semibold mt-8 mb-3">Recent bookings</h2>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Hostel</th>
                      <th className="py-2 px-4 font-medium">Status</th>
                      <th className="py-2 px-4 font-medium">Fee</th>
                      <th className="py-2 px-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map((b) => (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{b.hostel_name}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                            {b.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4">{formatPrice(b.amount)}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{formatDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
