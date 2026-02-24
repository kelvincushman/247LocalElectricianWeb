// Script to migrate existing blog posts to the database
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5438,
  database: process.env.DB_NAME || 'electrician_db',
  user: process.env.DB_USER || 'electrician',
  password: process.env.DB_PASSWORD || 'Prawowi1976',
});

// Existing blog posts from blogPosts.ts
const blogPosts = [
  {
    id: "1",
    title: "Why Every Home Needs RCD Protection in 2025",
    slug: "why-every-home-needs-rcd-protection-2025",
    excerpt: "Residual Current Devices (RCDs) are one of the most important safety components in any domestic electrical installation. Learn why upgrading your consumer unit is essential.",
    category: "Safety",
    date: "2025-01-15",
    content: `<p>Residual Current Devices (RCDs) are one of the most important safety components in any domestic electrical installation. As of the latest BS 7671 regulations, virtually all new or upgraded circuits in UK homes must have RCD protection. Despite this, thousands of older properties are still running on outdated fuse boards that lack this essential life-saving feature.</p>

<h2>What Is an RCD?</h2>

<p>An RCD is a device that constantly monitors the flow of electricity. If it detects even a small imbalance—meaning electricity is leaking somewhere it shouldn't—it trips the circuit in under a second.</p>

<p>This protects against:</p>
<ul>
<li>Electric shock</li>
<li>Electrical fires</li>
<li>Faulty appliances</li>
<li>Damaged wiring</li>
</ul>

<p>Unlike older fuses that primarily protect wiring, RCDs protect <strong>people</strong>.</p>

<h2>Why Homes in 2025 Need RCD Protection</h2>

<p>Modern homes use more electrical appliances than ever. EV chargers, electric showers, induction hobs, solar inverters, smart tech—these all place extra strain on electrical systems.</p>

<p>RCDs offer protection against:</p>
<ul>
<li>Worn cable insulation</li>
<li>DIY damage to wiring</li>
<li>Water ingress in bathrooms & kitchens</li>
<li>Miswired sockets</li>
<li>Faulty outdoor equipment</li>
</ul>

<p>Older fuse boards were simply not designed for today's electrical demands.</p>

<h2>Are RCDs a Legal Requirement?</h2>

<p>Under BS 7671:2018+A2:2022, RCDs are mandatory for:</p>
<ul>
<li>All socket outlets</li>
<li>All circuits in bathrooms</li>
<li>All circuits in domestic properties during consumer unit upgrades</li>
<li>EV chargers</li>
<li>Outdoor circuits</li>
</ul>

<p>If your home doesn't meet these standards, an upgrade is strongly recommended.</p>

<h2>Benefits of Upgrading to RCD Protection</h2>
<ul>
<li>Improved safety for your family</li>
<li>Compliance with current electrical regulations</li>
<li>Lower insurance risks</li>
<li>Peace of mind</li>
<li>Better protection for modern appliances</li>
<li>Essential for EV, solar, and heating upgrades</li>
</ul>

<h2>How We Can Help</h2>

<p>We offer full consumer unit upgrades with modern RCD or RCBO protection. All work is carried out to BS 7671 standards and includes full certification.</p>

<p><strong>If your fuse board is old, tripping, or doesn't have RCDs, now is the time to upgrade.</strong></p>`
  },
  {
    id: "2",
    title: "How Often Should You Have Your Electrics Tested?",
    slug: "how-often-should-you-have-electrics-tested",
    excerpt: "Electrical testing is something many homeowners forget about, yet it's one of the most important parts of keeping a home safe.",
    category: "Testing",
    date: "2025-01-10",
    content: `<p>Electrical testing is something many homeowners forget about, yet it's one of the most important parts of keeping a home safe. Just like a car needs an MOT, your electrical installation needs regular inspection to ensure everything is still safe, compliant, and working properly.</p>

<h2>What Is an EICR?</h2>

<p>An Electrical Installation Condition Report (EICR) is a detailed inspection carried out by a qualified electrician. It checks:</p>
<ul>
<li>Wiring condition</li>
<li>Earthing & bonding</li>
<li>Consumer unit safety</li>
<li>Socket & switch condition</li>
<li>Signs of overheating or damage</li>
<li>Compliance with BS 7671</li>
</ul>

<h2>How Often Should You Test Your Home?</h2>

<p>The recommended timeframes are:</p>
<ul>
<li><strong>Homeowners:</strong> Every 10 years</li>
<li><strong>Landlords:</strong> Every 5 years (legal requirement)</li>
<li><strong>Rental properties:</strong> At each change of tenancy</li>
<li><strong>Homes with high electrical demand:</strong> Every 5 years</li>
</ul>

<p>If you've recently purchased a home, an EICR is strongly advised unless one was carried out recently.</p>

<h2>Signs You May Need Testing Sooner</h2>
<ul>
<li>Tripping circuits</li>
<li>Flickering lights</li>
<li>Burning smells</li>
<li>Discoloured sockets</li>
<li>Frequent blown fuses</li>
<li>Electric shocks or tingles</li>
<li>Outdated wiring</li>
</ul>

<p>If you notice any of these signs, testing should be done immediately.</p>

<h2>Why Electrical Testing Matters</h2>

<p>Electrical faults are one of the leading causes of accidental house fires in the UK. Testing helps identify:</p>
<ul>
<li>Loose connections</li>
<li>Overloaded circuits</li>
<li>Ageing or damaged cables</li>
<li>Incorrect DIY work</li>
<li>Dangerous consumer units</li>
</ul>

<p>Fixing issues early prevents costly repairs later.</p>

<h2>Landlords: Your Legal Responsibility</h2>

<p>Since 2020, landlords must have:</p>
<ul>
<li>A valid EICR every 5 years</li>
<li>Proof of remedial work (if required)</li>
<li>A copy given to tenants</li>
</ul>

<p>Fines for non-compliance can reach <strong>£30,000</strong>.</p>

<h2>Our Testing Service</h2>

<p>We provide fast, professional EICRs for homeowners and landlords across the West Midlands. All reports are clear, accurate, and compliant with BS 7671.</p>

<p><strong>If it's been more than 5–10 years since your last test, it's time to book an inspection.</strong></p>`
  },
  {
    id: "3",
    title: "The Importance of Earthing & Bonding in Domestic Properties",
    slug: "importance-of-earthing-bonding-domestic-properties",
    excerpt: "Earthing and bonding are critical safety measures designed to protect people and property from electric shock and fire.",
    category: "Safety",
    date: "2025-01-05",
    content: `<p>Earthing and bonding are critical safety measures designed to protect people and property from electric shock and fire. Without proper earthing, fault currents can travel through appliances, pipework, or even people. Bonding ensures that metal parts within a property stay at the same electrical potential, reducing shock risk.</p>

<h2>What Is Earthing?</h2>
<p>Earthing provides a direct path for electrical current to safely return to the ground if a fault occurs. This allows protective devices such as RCDs or MCBs to operate correctly.</p>

<h2>What Is Bonding?</h2>
<p>Bonding links metallic services—such as gas pipes, water pipes, and structural steel—to prevent dangerous voltages.</p>

<h2>Why It Matters</h2>
<ul>
<li>Prevents electric shock</li>
<li>Ensures protective devices operate correctly</li>
<li>Reduces fire risks</li>
<li>Required by BS 7671</li>
</ul>

<h2>When Should Earthing & Bonding Be Upgraded?</h2>
<ul>
<li>When installing new circuits</li>
<li>When upgrading the consumer unit</li>
<li>When signs of corrosion or incorrect sizing are found</li>
</ul>

<p><strong>Proper earthing & bonding saves lives.</strong></p>`
  },
  {
    id: "4",
    title: "What BS 7671 Means for Homeowners",
    slug: "what-bs-7671-means-for-homeowners",
    excerpt: "BS 7671, also known as the IET Wiring Regulations, governs how electrical installations must be designed, installed, and maintained in the UK.",
    category: "Regulations",
    date: "2025-01-01",
    content: `<p>BS 7671, also known as the IET Wiring Regulations, governs how electrical installations must be designed, installed, and maintained in the UK.</p>

<h2>Why It Matters to Homeowners</h2>
<p>BS 7671 is designed to:</p>
<ul>
<li>Protect against electric shock</li>
<li>Prevent electrical fires</li>
<li>Ensure installations are safe and reliable</li>
<li>Promote energy efficiency</li>
</ul>

<h2>Key Requirements</h2>
<ul>
<li>RCD protection for most circuits</li>
<li>Proper circuit design & load calculation</li>
<li>Approved cable types and installation methods</li>
<li>Mandatory testing & certification</li>
</ul>

<h2>When BS 7671 Applies</h2>
<ul>
<li>New installations</li>
<li>Additions or alterations</li>
<li>Consumer unit upgrades</li>
</ul>

<p><strong>If you are improving your home, BS 7671 compliance is essential.</strong></p>`
  },
  {
    id: "5",
    title: "Common Causes of Tripping Circuits",
    slug: "common-causes-of-tripping-circuits",
    excerpt: "Tripping circuits are one of the most common electrical issues homeowners face. Learn what causes them and how to fix them.",
    category: "Fault Finding",
    date: "2024-12-28",
    content: `<p>Tripping circuits are one of the most common electrical issues homeowners face.</p>

<h2>Top Causes</h2>
<ol>
<li>Faulty appliances</li>
<li>Overloaded circuits</li>
<li>Water ingress</li>
<li>Damaged wiring</li>
<li>Faulty sockets or switches</li>
<li>Loose connections</li>
<li>Nuisance tripping from sensitive RCDs</li>
</ol>

<h2>What You Should Do</h2>
<ul>
<li>Check appliances individually</li>
<li>Avoid extension lead overloads</li>
<li>Look for visible damage</li>
<li>Call a qualified electrician if unsure</li>
</ul>

<p><strong>We specialise in fast fault-finding and diagnosis.</strong></p>`
  },
  {
    id: "6",
    title: "What to Expect During an EICR",
    slug: "what-to-expect-during-eicr",
    excerpt: "An EICR is a detailed assessment of your electrical installation. Here's what happens during the inspection.",
    category: "Testing",
    date: "2024-12-20",
    content: `<p>An EICR is a detailed assessment of your electrical installation.</p>

<h2>What We Check</h2>
<ul>
<li>Wiring condition</li>
<li>Consumer unit</li>
<li>RCD operation</li>
<li>Socket and switch integrity</li>
<li>Earthing & bonding</li>
<li>Circuit load</li>
</ul>

<h2>EICR Outcomes</h2>
<ul>
<li><strong>C1:</strong> Dangerous – immediate action required</li>
<li><strong>C2:</strong> Potentially dangerous</li>
<li><strong>C3:</strong> Improvement recommended</li>
<li><strong>FI:</strong> Further investigation needed</li>
</ul>

<h2>How Long It Takes</h2>
<p>1–4 hours depending on property size.</p>

<p><strong>EICRs keep your home safe, compliant, and insurable.</strong></p>`
  },
  {
    id: "7",
    title: "Electrical Safety Tips for Landlords",
    slug: "electrical-safety-tips-for-landlords",
    excerpt: "Landlords must legally keep electrical installations safe. Here's what you need to know about your responsibilities.",
    category: "Landlords",
    date: "2024-12-15",
    content: `<p>Landlords must legally keep electrical installations safe.</p>

<h2>Your Responsibilities</h2>
<ul>
<li>EICR every 5 years</li>
<li>Provide tenants with a copy</li>
<li>Complete remedial work promptly</li>
</ul>

<h2>Common Landlord Issues</h2>
<ul>
<li>Damaged sockets</li>
<li>Old wiring</li>
<li>Loose connections</li>
<li>Worn accessories</li>
</ul>

<p><strong>Regular testing protects tenants and avoids fines.</strong></p>`
  },
  {
    id: "8",
    title: "Why Consumer Unit Upgrades Are Essential",
    slug: "why-consumer-unit-upgrades-essential",
    excerpt: "Older fuse boards lack modern protection. Learn why upgrading your consumer unit improves safety.",
    category: "Upgrades",
    date: "2024-12-10",
    content: `<p>Older fuse boards lack modern protection.</p>

<h2>Modern Consumer Units Include</h2>
<ul>
<li>RCDs and RCBOs</li>
<li>Surge protection</li>
<li>Non-combustible enclosures</li>
</ul>

<h2>When to Upgrade</h2>
<ul>
<li>Adding EV chargers</li>
<li>Property renovation</li>
<li>Signs of overheating</li>
</ul>

<p><strong>Upgrading improves safety and reduces risk.</strong></p>`
  },
  {
    id: "9",
    title: "Signs Your Shower Needs Rewiring",
    slug: "signs-your-shower-needs-rewiring",
    excerpt: "Electric showers draw a high load. Here are the warning signs that your shower circuit needs attention.",
    category: "Fault Finding",
    date: "2024-12-05",
    content: `<p>Electric showers draw a high load.</p>

<h2>Signs of Trouble</h2>
<ul>
<li>Flickering lights</li>
<li>Burnt smell</li>
<li>Warm cables</li>
<li>Tripping MCBs or RCDs</li>
</ul>

<p><strong>We specialise in shower wiring upgrades.</strong></p>`
  },
  {
    id: "10",
    title: "How to Prepare Your Home for EV Charging",
    slug: "how-to-prepare-home-for-ev-charging",
    excerpt: "EV chargers require proper design and installation. Here's what you need to consider.",
    category: "EV Charging",
    date: "2024-12-01",
    content: `<p>EV chargers require proper design.</p>

<h2>Considerations</h2>
<ul>
<li>Load balancing</li>
<li>Earthing arrangements</li>
<li>RCD Type A/F/B requirements</li>
<li>Cable routes</li>
</ul>

<p><strong>We install EV chargers to BS 7671 and IET Code of Practice.</strong></p>`
  },
  {
    id: "11",
    title: "Why Using a Local Electrician Saves You Money",
    slug: "why-using-local-electrician-saves-money",
    excerpt: "Local electricians offer faster response times and lower travel costs. Here's why local matters.",
    category: "Advice",
    date: "2024-11-25",
    content: `<p>Local electricians offer faster response times and lower travel costs. Unlike large national firms, we understand the area, typical property layouts, and common electrical issues in the West Midlands. This reduces labour time, emergency call-out delays, and unnecessary charges.</p>

<h2>Benefits of Choosing Local</h2>
<ul>
<li>Faster attendance times</li>
<li>Reduced travel fees</li>
<li>Personal, friendly service</li>
<li>Better accountability and reputation</li>
<li>Support for the local economy</li>
</ul>

<h2>Why Local Matters in 2025</h2>
<p>With rising energy demands and more complex home electrics, homeowners need electricians who can respond quickly and maintain ongoing reliability.</p>

<p><strong>A trusted local electrician saves you time, money, and stress.</strong></p>`
  },
  {
    id: "12",
    title: "The Dangers of DIY Electrical Work",
    slug: "dangers-of-diy-electrical-work",
    excerpt: "DIY electrical work may seem tempting, but it's one of the leading causes of electrical fires and safety hazards.",
    category: "Safety",
    date: "2024-11-20",
    content: `<p>DIY electrical work may seem tempting for small jobs, but in reality, it's one of the leading causes of electrical fires and safety hazards in UK homes. Many homeowners don't realise that incorrect electrical work can also <strong>void home insurance</strong>, leaving you unprotected in the event of a fire.</p>

<h2>Why DIY Electrics Are Dangerous</h2>
<p>Electricity is invisible and unforgiving. Even small mistakes can have life-threatening consequences.</p>

<p>Common DIY mistakes include:</p>
<ul>
<li>Loose connections that overheat</li>
<li>Incorrect cable sizes</li>
<li>Unprotected circuits</li>
<li>Poor insulation or exposed wiring</li>
<li>Overloaded extension leads</li>
<li>Incorrect polarity (live/neutral reversed)</li>
</ul>

<h2>Legal Requirements Homeowners Often Don't Know</h2>
<p>Under UK law, certain electrical work is <strong>notifiable</strong>, meaning it must be inspected or certified by a qualified person. This includes:</p>
<ul>
<li>Consumer unit replacements</li>
<li>New circuits</li>
<li>Work in kitchens</li>
<li>Work in bathrooms</li>
<li>Outdoor wiring</li>
</ul>

<p>Failing to comply can lead to:</p>
<ul>
<li>Insurance refusal</li>
<li>Council enforcement</li>
<li>Property devaluation</li>
</ul>

<h2>When DIY Is Acceptable</h2>
<p>Only very basic tasks are considered safe for non-electricians, such as:</p>
<ul>
<li>Changing bulbs</li>
<li>Replacing like-for-like faceplates (if confident)</li>
<li>Resetting breakers</li>
</ul>

<p>Even then, risks exist.</p>

<p><strong>When it comes to electrical safety, always hire a qualified professional.</strong></p>`
  },
  {
    id: "13",
    title: "How Fault-Finding Works — A Professional Electrician's Process",
    slug: "how-fault-finding-works-professional-process",
    excerpt: "Electrical faults can be frustrating. Here's how professional electricians diagnose and fix problems safely.",
    category: "Fault Finding",
    date: "2024-11-15",
    content: `<p>Electrical faults can be frustrating for homeowners. Lights flicker, sockets stop working, or circuits trip for no obvious reason. But behind the scenes, electrical systems follow strict patterns—and trained electricians use structured testing to pinpoint the exact cause of a problem.</p>

<h2>Step 1: Understanding the Symptoms</h2>
<p>We begin by gathering information:</p>
<ul>
<li>When does the issue occur?</li>
<li>What appliances are in use?</li>
<li>Does the problem affect one room or the whole house?</li>
<li>Has any DIY work been done recently?</li>
</ul>

<h2>Step 2: Visual Inspection</h2>
<p>Before any testing, we check for obvious issues:</p>
<ul>
<li>Burnt smells</li>
<li>Discoloured socket plates</li>
<li>Loose fittings</li>
<li>Damaged cables</li>
<li>Water ingress</li>
</ul>

<h2>Step 3: Testing the Circuit</h2>
<p>Using professional tools, we test:</p>
<ul>
<li>Continuity</li>
<li>Polarity</li>
<li>Insulation resistance</li>
<li>Earth loop impedance</li>
<li>RCD response times</li>
</ul>

<h2>Step 4: Isolating the Source</h2>
<p>Once the faulty circuit is identified, we break it down further:</p>
<ul>
<li>Is the issue in the cable?</li>
<li>Is it at a switch or socket?</li>
<li>Is an appliance causing it?</li>
</ul>

<h2>Step 5: Repair & Prevention</h2>
<p>After finding the root cause, we make the repair, then advise on steps to prevent future issues.</p>

<p><strong>Proper diagnosis saves time, money, and keeps your home safe.</strong></p>`
  }
];

// Category mapping
const categoryMap = {
  'Safety': 'safety',
  'Testing': 'tips-advice',
  'Regulations': 'tips-advice',
  'Fault Finding': 'tips-advice',
  'Landlords': 'tips-advice',
  'Upgrades': 'tips-advice',
  'EV Charging': 'tips-advice',
  'Advice': 'tips-advice'
};

async function migratePosts() {
  try {
    // Get category IDs
    const categoriesResult = await pool.query('SELECT id, slug FROM blog_categories');
    const categories = {};
    categoriesResult.rows.forEach(cat => {
      categories[cat.slug] = cat.id;
    });

    // Get the admin user ID
    const userResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['super_admin']);
    const authorId = userResult.rows.length > 0 ? userResult.rows[0].id : null;

    console.log('Categories:', categories);
    console.log('Author ID:', authorId);

    // Insert each blog post
    for (const post of blogPosts) {
      const categorySlug = categoryMap[post.category] || 'tips-advice';
      const categoryId = categories[categorySlug] || categories['tips-advice'];

      // Check if post already exists
      const existing = await pool.query('SELECT id FROM blog_posts WHERE slug = $1', [post.slug]);

      if (existing.rows.length > 0) {
        console.log(`Post "${post.title}" already exists, updating...`);
        await pool.query(
          `UPDATE blog_posts SET
            title = $1, excerpt = $2, content = $3, category_id = $4,
            status = 'published', published_at = $5, updated_at = NOW()
          WHERE slug = $6`,
          [post.title, post.excerpt, post.content, categoryId, post.date, post.slug]
        );
      } else {
        console.log(`Inserting post: ${post.title}`);
        await pool.query(
          `INSERT INTO blog_posts (title, slug, excerpt, content, category_id, author_id, status, published_at)
          VALUES ($1, $2, $3, $4, $5, $6, 'published', $7)`,
          [post.title, post.slug, post.excerpt, post.content, categoryId, authorId, post.date]
        );
      }
    }

    console.log('\nMigration complete! All blog posts have been imported.');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

migratePosts();
