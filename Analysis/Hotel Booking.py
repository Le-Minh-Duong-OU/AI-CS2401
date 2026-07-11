# ==========================================================
# Hotel Booking Demand - Exploratory Data Analysis (EDA)
# Demo https://github.com/aaqibqadeer/Hotel-booking-demand/blob/master/Hotel%20Booking.ipynb
# ==========================================================

# Install:
# python -m pip install pandas numpy matplotlib seaborn

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# ----------------------------------------------------------
# Global Setting
# ----------------------------------------------------------

sns.set_theme(style="whitegrid")

plt.rcParams.update({
    "font.size": 11,
    "axes.titlesize": 13,
    "axes.titleweight": "bold",
    "axes.labelsize": 11,
    "figure.dpi": 150
})

# ----------------------------------------------------------
# Read Dataset
# ----------------------------------------------------------

df = pd.read_csv("../Data/hotel_bookings.csv")

pd.set_option("display.max_columns", None)

print("=" * 60)
print("Dataset Shape:", df.shape)
print("=" * 60)

print(df.head())

print("\nDataset Information")
print(df.info())

print("\nMissing Values")
print(df.isnull().sum())

# ==========================================================
# Helper Function
# ==========================================================

def save_figure(fig, filename):
    """Chỉ lưu ảnh nếu chưa tồn tại"""

    if os.path.exists(filename):
        print(f"⏩ {filename} đã tồn tại -> bỏ qua")
    else:
        fig.savefig(filename, dpi=300, bbox_inches="tight")
        print(f"✅ Đã lưu {filename}")

# ==========================================================
# Figure 3.1
# ==========================================================

fig1, axes = plt.subplots(1, 2, figsize=(11, 4.5))

colors = ["#2E86AB", "#E76F51"]

counts = df["is_canceled"].value_counts().sort_index()

bars = axes[0].bar(
    ["Not Cancelled", "Cancelled"],
    counts.values,
    color=colors
)

for bar, value in zip(bars, counts.values):
    axes[0].text(
        bar.get_x() + bar.get_width()/2,
        value + 1500,
        f"{value:,}\n({value/len(df)*100:.1f}%)",
        ha="center"
    )

axes[0].set_title("Distribution of Target Variable")
axes[0].set_ylabel("Bookings")

cancel_rate = pd.crosstab(
    df["hotel"],
    df["is_canceled"],
    normalize="index"
) * 100

cancel_rate.columns = ["Not Cancelled", "Cancelled"]

cancel_rate.plot(
    kind="bar",
    stacked=True,
    color=colors,
    ax=axes[1]
)

axes[1].set_title("Cancellation Rate by Hotel Type")
axes[1].set_ylabel("Percentage (%)")
axes[1].tick_params(axis="x", rotation=0)

fig1.tight_layout()

# ==========================================================
# Figure 3.2
# ==========================================================

fig2, axes = plt.subplots(1, 2, figsize=(11, 4.5))

axes[0].hist(
    df["lead_time"],
    bins=60,
    color="#2E86AB",
    edgecolor="white"
)

axes[0].set_title("Lead Time Distribution")
axes[0].set_xlabel("Lead Time (Days)")
axes[0].set_ylabel("Frequency")

bp = axes[1].boxplot(
    df["adr"],
    patch_artist=True
)

for box in bp["boxes"]:
    box.set_facecolor("#E76F51")
    box.set_alpha(0.6)

axes[1].set_xticks([1])
axes[1].set_xticklabels(["ADR"])

axes[1].set_title("ADR Boxplot")
axes[1].set_ylabel("Average Daily Rate")

fig2.tight_layout()

# ==========================================================
# Figure 3.3
# ==========================================================

numeric_df = df.select_dtypes(include=np.number)

fig3, ax = plt.subplots(figsize=(14, 10))

sns.heatmap(
    numeric_df.corr(),
    cmap="coolwarm",
    center=0,
    annot=True,
    fmt=".2f",
    linewidths=0.5,
    ax=ax
)

ax.set_title("Correlation Matrix")

fig3.tight_layout()

# ==========================================================
# Figure 3.4
# ==========================================================

month_order = [
    "January","February","March","April",
    "May","June","July","August",
    "September","October","November","December"
]

rate_month = (
    df.groupby("arrival_date_month")["is_canceled"]
      .mean()
      .reindex(month_order)
      * 100
)

market = (
    df.groupby("market_segment")["is_canceled"]
      .agg(["mean","count"])
)

market = market[market["count"] >= 200]
market = market.sort_values("mean", ascending=False)

fig4, axes = plt.subplots(1, 2, figsize=(12, 4.5))

axes[0].plot(
    month_order,
    rate_month.values,
    marker="o",
    linewidth=2,
    color="#E76F51"
)

axes[0].set_title("Cancellation Rate by Month")
axes[0].set_xlabel("Month")
axes[0].set_ylabel("Cancellation Rate (%)")
axes[0].tick_params(axis="x", rotation=45)

axes[1].barh(
    market.index,
    market["mean"] * 100,
    color="#2E86AB"
)

axes[1].invert_yaxis()

axes[1].set_title("Cancellation Rate by Market Segment")
axes[1].set_xlabel("Cancellation Rate (%)")

fig4.tight_layout()

# ==========================================================
# Save Figures
# ==========================================================

save_figure(fig1, "Figure_3_1.png")
save_figure(fig2, "Figure_3_2.png")
save_figure(fig3, "Figure_3_3.png")
save_figure(fig4, "Figure_3_4.png")

print("\nHoàn thành tạo biểu đồ!")

# ==========================================================
# Show Figures
# ==========================================================

plt.show()