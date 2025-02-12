import React, { useState, useEffect } from "react";
import axios from '../services/axios-interceptor';
import '../styles/adminLists.css';
import AdminNav from "./AdminNav";
import AdminEditProduct from "./AdminEditProduct";
import AdminAddProduct from "./AdminAddProduct";
import { useNavigate } from "react-router-dom";

const ConfirmationModal = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div
            id="ConfirmationModal"
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
            <div className="modal-box">
                <div className="confirmation-message">
                    Are you sure you want to delete this product?
                </div>
                <div className="confirmation-buttons">
                    <button className='confirmation-button' onClick={onConfirm}>Yes</button>
                    <button className='confirmation-button' onClick={onCancel}>No</button>
                </div>
            </div>
        </div>
    );
};


const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const [addProductModal, setAddProductModal] = useState(false);
    const [editProductModal, setEditProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);


    const navigate = useNavigate()


    const toggleAddProductModal = () => {
        setAddProductModal(!addProductModal);
    };

    const toggleEditProductModal = (productId) => {
        setEditProductModal(!editProductModal);
        setSelectedProduct(productId);
    };

    const toggleDeleteModal = (productId) => {
        setShowConfirmationModal(!showConfirmationModal);
        setSelectedProduct(productId);
    };


    const fetchAllProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/product/admin');
            setProducts(response.data);
        } catch (error) {
            console.log(error.response.status);

            if (error.response.status === 401) {
                localStorage.clear()
                navigate('/Login')
            }
            else if (error.response.status === 403) {
                navigate('/HomePage')

            }
        }
    }


    useEffect(() => {

        fetchAllProducts();
    }, []);

    const removeFromCart = (productId) => {
        toggleDeleteModal(productId);
    };

    const handleConfirmationConfirm = async () => {
        if (selectedProduct) {
            const productId = selectedProduct;
            try {
                await axios.delete(`http://localhost:3000/api/product/${productId}`);
                setProducts(products.filter((product) => product.id !== productId));
                console.log("Product deleted successfully");
            } catch (error) {

                console.error('Error deleting product', error);

                if (error.response.status === 401) {
                    localStorage.clear()
                    navigate('/Login')
                }
                else if (error.response.status === 403) {
                    navigate('/HomePage')
                }
            }
        }

        setShowConfirmationModal(false);
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <AdminNav />
                <div className="add-product-button-container">
                    <button className='admin-add-product-button' onClick={toggleAddProductModal}>Add Product</button>
                </div>
            </div>

            {addProductModal && (
                <div className="modal-custom">
                    <div onClick={toggleAddProductModal} className="overlay"></div>
                    <div className="modal-content-custom-admin">
                        <AdminAddProduct />
                    </div>
                </div>
            )}
            {showConfirmationModal && selectedProduct && (
                <div className="modal-custom">
                    <div onClick={toggleDeleteModal} className="overlay"></div>
                    <div className="modal-content-custom-admin">
                        <ConfirmationModal
                            isOpen={showConfirmationModal}
                            onCancel={() => setShowConfirmationModal(false)}
                            onConfirm={handleConfirmationConfirm}
                        />
                    </div>
                </div>
            )}

            {editProductModal && selectedProduct && (
                <div className="modal-custom">
                    <div onClick={toggleEditProductModal} className="overlay"></div>
                    <div className="modal-content-custom-admin">
                        <AdminEditProduct selectedProduct={selectedProduct} />
                    </div>
                </div>
            )}

            <div className="admin-content">
                <table className="admin-product-table">
                    <thead>
                        <tr className="table-titles">
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Animal</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={index}>
                                <td className="table-content">{product.name}</td>
                                <td className="table-content">${product.price}</td>
                                <td className="table-content">{product.category}</td>
                                <td className="table-content">{product.animal}</td>
                                <td className="table-content">{product.description}</td>
                                <td >
                                    <div className="admin-buttons">
                                        <button
                                            className="admin-product-button"
                                            onClick={() => {
                                                toggleEditProductModal(product);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="admin-product-button"
                                            onClick={() => removeFromCart(product.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductList;
