import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Dashboard.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalUsers: 0,
    totalPromotions: 0,
  });

  const [productTrends, setProductTrends] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      // จัดการกับ Firestore Timestamp
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString("th-TH");
      }

      // จัดการกับ string timestamp
      if (typeof timestamp === "string") {
        return new Date(timestamp).toLocaleString("th-TH");
      }

      // จัดการกับ Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString("th-TH");
      }

      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products
        const productsSnapshot = await getDocs(collection(db, "products"));
        const products = productsSnapshot.docs.map((doc) => doc.data());

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => doc.data());

        // Fetch promotions
        const promotionsSnapshot = await getDocs(collection(db, "promotions"));
        const promotions = promotionsSnapshot.docs.map((doc) => doc.data());

        // Calculate summary
        const summary = {
          totalProducts: products.length,
          activeProducts: products.filter((p) => p.Status === "active").length,
          inactiveProducts: products.filter((p) => p.Status === "inactive")
            .length,
          totalUsers: users.length,
          totalPromotions: promotions.length,
        };

        // Calculate category distribution
        const categories = {};
        products.forEach((product) => {
          if (product.Categories) {
            if (categories[product.Categories]) {
              categories[product.Categories]++;
            } else {
              categories[product.Categories] = 1;
            }
          }
        });

        // Calculate product trends (last 6 months)
        const trends = calculateProductTrends(products);

        setSummary(summary);
        setCategoryDistribution(categories);
        setProductTrends(trends);

        // Get recent activities with more activity types
        const activities = [
          // Product activities
          ...products.map((p) => ({
            type: "product",
            action: p.Status === "active" ? "activated" : "deactivated",
            date: p.LastUpdate || p.CreatedAt,
            item: p.Name,
            details: `Status: ${p.Status}`,
          })),

          // Promotion activities
          ...promotions.map((p) => ({
            type: "promotion",
            action: new Date(p.endDateTime) > new Date() ? "active" : "expired",
            date: p.startDateTime || p.createdAt,
            item: p.name,
            details: `Discount: ${p.discount}%`,
          })),
        ]
          .filter((activity) => activity.date) // กรองเฉพาะรายการที่มีวันที่
          .sort((a, b) => {
            const dateA = a.date?.seconds
              ? a.date.seconds
              : new Date(a.date).getTime() / 1000;
            const dateB = b.date?.seconds
              ? b.date.seconds
              : new Date(b.date).getTime() / 1000;
            return dateB - dateA;
          })
          .slice(0, 10);

        setRecentActivities(activities);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateProductTrends = (products) => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return d.toLocaleString("default", { month: "short" });
    }).reverse();

    const monthlyProducts = months.map((month) => ({
      month,
      count: products.filter((p) => {
        const productDate = new Date(p.CreatedAt?.seconds * 1000);
        return (
          productDate.toLocaleString("default", { month: "short" }) === month
        );
      }).length,
    }));

    return monthlyProducts;
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const lineChartData = {
    labels: productTrends.map((t) => t.month),
    datasets: [
      {
        label: "New Products",
        data: productTrends.map((t) => t.count),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const doughnutChartData = {
    labels: Object.keys(categoryDistribution),
    datasets: [
      {
        data: Object.values(categoryDistribution),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const barChartData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Product Status",
        data: [summary.activeProducts, summary.inactiveProducts],
        backgroundColor: ["#4CAF50", "#f44336"],
      },
    ],
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Products</h3>
          <p>{summary.totalProducts}</p>
        </div>
        <div className="card">
          <h3>Active Products</h3>
          <p>{summary.activeProducts}</p>
        </div>
        <div className="card">
          <h3>Total Users</h3>
          <p>{summary.totalUsers}</p>
        </div>
        <div className="card">
          <h3>Active Promotions</h3>
          <p>{summary.totalPromotions}</p>
        </div>
      </div>

      <div className="charts">
        <div className="chart-container">
          <h3>Product Trends</h3>
          <div className="chart-wrapper">
            <Line
              data={lineChartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>Category Distribution</h3>
          <div className="chart-wrapper">
            <Doughnut
              data={doughnutChartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>Product Status</h3>
          <div className="chart-wrapper">
            <Bar
              data={barChartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
              }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Recent Activities</h3>
        <div className="activities-list">
          {recentActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className={`activity-icon ${activity.type}`}></span>
              <div className="activity-details">
                <p>
                  <strong>{activity.item}</strong> {activity.action}
                </p>
                <span>{activity.details}</span>
                <small>{formatDate(activity.date)}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
