import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { Product, Pagination as PaginationType } from '../types';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { LowStockBadge } from '../components/products/LowStockBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';
import { PackagePlus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      if (showLowStockOnly) {
        const lowStock = await productService.getLowStockProducts();
        setProducts(lowStock);
        setPagination({ page: 1, limit: lowStock.length, total: lowStock.length, totalPages: 1 });
      } else {
        const res = await productService.getProducts({
          page,
          limit: 10,
          search,
          category: categoryFilter || undefined,
        });
        setProducts(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch inventory catalog', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, showLowStockOnly, showToast]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleCreateOrUpdate = async (data: Partial<Product>) => {
    try {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, data);
        showToast('Product updated successfully', 'success');
      } else {
        await productService.createProduct(data);
        showToast('New product added to inventory', 'success');
      }
      setIsFormOpen(false);
      setSelectedProduct(null);
      fetchProducts(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await productService.deleteProduct(productToDelete.id);
      showToast('Product deleted from inventory', 'success');
      setIsDeleteOpen(false);
      setProductToDelete(null);
      fetchProducts(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting product', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products & Inventory Catalog</h1>
          <p className="page-subtitle">Manage SKU codes, unit pricing, warehouse locations & stock threshold alerts</p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
          <Button
            variant="primary"
            icon={<PackagePlus size={18} />}
            onClick={() => {
              setSelectedProduct(null);
              setIsFormOpen(true);
            }}
          >
            Add Product
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search product name, SKU, category, warehouse location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={showLowStockOnly}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className={`btn ${showLowStockOnly ? 'btn-danger' : 'btn-secondary'} btn-sm`}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          >
            <AlertTriangle size={14} />
            <span>{showLowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock'}</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          No inventory products found matching your search.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Warehouse Location</th>
                <th>Status</th>
                {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = p.currentStock <= p.minimumStock;
                return (
                  <tr key={p.id} style={{ backgroundColor: isLow ? '#fef2f2' : undefined }}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(p.unitPrice)}</td>
                    <td style={{ fontWeight: 700, color: isLow ? '#dc2626' : '#0f172a' }}>
                      {p.currentStock} units
                    </td>
                    <td>{p.minimumStock}</td>
                    <td>{p.warehouseLocation}</td>
                    <td>
                      {isLow ? (
                        <LowStockBadge currentStock={p.currentStock} minimumStock={p.minimumStock} />
                      ) : (
                        <Badge status="ACTIVE" label="IN STOCK" />
                      )}
                    </td>
                    {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Product"
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete Product"
                            onClick={() => {
                              setProductToDelete(p);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!showLowStockOnly && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(newPage) => fetchProducts(newPage)}
            />
          )}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        product={selectedProduct}
      />

      {/* Delete Product Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Delete Product"
        message={`Are you sure you want to remove product '${productToDelete?.name}' (SKU: ${productToDelete?.sku}) from the inventory catalog?`}
        confirmText="Delete Product"
        confirmVariant="danger"
      />
    </div>
  );
};
