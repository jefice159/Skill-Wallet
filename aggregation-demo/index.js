const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/aggregationDB')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ Connection Error:', err));

const salesSchema = new mongoose.Schema({
  productName: String,
  category: String,
  price: Number,
  quantity: Number,
  date: { type: Date, default: Date.now }
});

const Sales = mongoose.model('Sales', salesSchema);

async function runAggregations() {
  try {
    await Sales.deleteMany({});
    console.log('\n✓ Database cleared');

    console.log('\n=== STEP 2: Insert Sample Data ===');
    const sampleData = [
      { productName: 'Laptop', category: 'Electronics', price: 1000, quantity: 5 },
      { productName: 'Mouse', category: 'Electronics', price: 25, quantity: 50 },
      { productName: 'Keyboard', category: 'Electronics', price: 75, quantity: 30 },
      { productName: 'Monitor', category: 'Electronics', price: 300, quantity: 10 },
      { productName: 'Desk Chair', category: 'Furniture', price: 200, quantity: 15 },
      { productName: 'Table', category: 'Furniture', price: 150, quantity: 8 },
      { productName: 'Lamp', category: 'Furniture', price: 50, quantity: 25 },
      { productName: 'Book', category: 'Books', price: 20, quantity: 100 },
      { productName: 'Pen', category: 'Books', price: 2, quantity: 200 },
      { productName: 'Notebook', category: 'Books', price: 10, quantity: 150 }
    ];

    await Sales.insertMany(sampleData);
    console.log(`✓ Inserted ${sampleData.length} records`);

    console.log('\n=== STEP 3: Basic Aggregation - $match ===');
    const electronicsOnly = await Sales.aggregate([
      { $match: { category: 'Electronics' } }
    ]);
    console.log('✓ Electronics products:', electronicsOnly.length, 'items');
    console.log(electronicsOnly);

    console.log('\n=== STEP 3: $group - Total Revenue by Category ===');
    const groupByCategory = await Sales.aggregate([
      {
        $group: {
          _id: '$category',
          totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } },
          productCount: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    console.log('✓ Revenue by Category:');
    console.log(groupByCategory);

    console.log('\n=== STEP 4: Advanced Aggregation - $project ===');
    const projectData = await Sales.aggregate([
      {
        $project: {
          productName: 1,
          category: 1,
          price: 1,
          quantity: 1,
          totalAmount: { $multiply: ['$price', '$quantity'] }
        }
      }
    ]);
    console.log('✓ Projected Data (with calculated totalAmount):');
    console.log(projectData);

    console.log('\n=== STEP 4: $sort - Top Products by Revenue ===');
    const sortedData = await Sales.aggregate([
      {
        $project: {
          productName: 1,
          category: 1,
          totalRevenue: { $multiply: ['$price', '$quantity'] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
    console.log('✓ Top 5 Products by Revenue:');
    console.log(sortedData);

    console.log('\n=== STEP 5: Complete Aggregation Pipeline ===');
    const completePipeline = await Sales.aggregate([
      { $match: { category: { $in: ['Electronics', 'Furniture'] } } },
      {
        $group: {
          _id: '$category',
          totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } },
          productCount: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          category: '$_id',
          _id: 0,
          totalRevenue: 1,
          productCount: 1,
          avgPrice: { $round: ['$avgPrice', 2] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    console.log('✓ Complete Pipeline Results:');
    console.log(completePipeline);

    console.log('\n=== STEP 6: Summary Report ===');
    const summaryReport = await Sales.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } },
          uniqueCategories: { $sum: 1 }
        }
      }
    ]);
    console.log('✓ Overall Summary:');
    console.log(summaryReport);

    console.log('\n✅ All Aggregation Operations Complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ MongoDB Connection Closed');
    process.exit(0);
  }
}

runAggregations();
