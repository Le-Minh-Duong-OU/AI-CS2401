# ==========================================================
# Hotel Booking Demand - Exploratory Data Analysis (EDA)
# Demo https://github.com/aaqibqadeer/Hotel-booking-demand/blob/master/Hotel%20Booking.ipynb
# ==========================================================

# Install:
# python -m pip install pandas numpy matplotlib seaborn scikit-learn

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import wandb
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

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

df = pd.read_csv("./Data/hotel_bookings.csv")

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



# ==========================================================
# CHAPTER 4
# PREPROCESSING
# ==========================================================

print("\n")
print("="*60)
print("CHAPTER 4 - PREPROCESSING")
print("="*60)

print("\nMissing Values")

missing = pd.DataFrame({
    "Missing": df.isnull().sum(),
    "Percent": (
        df.isnull().mean()*100
    ).round(2)
})

missing = missing[
    missing["Missing"] > 0
]

print(missing)



# ==========================================================
# Missing Value Handling
# ==========================================================

print("\nHandling Missing Values...")

# children là biến số
df["children"] = df["children"].fillna(
    df["children"].median()
)

# country là biến phân loại
df["country"] = df["country"].fillna(
    "Unknown"
)

# agent và company
df["agent"] = df["agent"].fillna(0)

df["company"] = df["company"].fillna(0)

print("\nRemaining Missing Values")

print(df.isnull().sum())

# ==========================================================
# Figure 4.1
# Missing Values Before Imputation
# ==========================================================

missing_plot = missing.sort_values(
    by="Missing",
    ascending=False
)

fig5, ax = plt.subplots(figsize=(8,5))

bars = ax.bar(
    missing_plot.index,
    missing_plot["Missing"],
    color="#E76F51"
)

for bar in bars:
    value = int(bar.get_height())
    ax.text(
        bar.get_x() + bar.get_width()/2,
        value,
        f"{value:,}",
        ha="center",
        va="bottom",
        fontsize=9
    )

ax.set_title("Missing Values Before Imputation")
ax.set_ylabel("Number of Missing Values")

fig5.tight_layout()

save_figure(
    fig5,
    "Figure_4_1.png"
)

# ==========================================================
# 4.2 Categorical Features
# ==========================================================

print("\n")
print("=" * 60)
print("4.2 CATEGORICAL FEATURES")
print("=" * 60)

categorical_cols = df.select_dtypes(
    include=["object", "string"]
).columns.tolist()

numeric_cols = df.select_dtypes(
    include=["number"]
).columns.tolist()

print("\nCategorical Columns")
print(categorical_cols)

print("\nNumeric Columns")
print(numeric_cols)

# ==========================================================
# Figure 4.2
# Number of Categories
# ==========================================================

excluded_categorical = [
    "reservation_status",
    "reservation_status_date",
    "assigned_room_type"
]

categorical_plot_cols = [
    col for col in categorical_cols
    if col not in excluded_categorical
]

category_count = (
    df[categorical_plot_cols]
    .nunique()
    .sort_values(ascending=True)
)

fig6, ax = plt.subplots(figsize=(8,5))

category_count.plot(
    kind="barh",
    color="#2E86AB",
    ax=ax
)

ax.set_title("Number of Categories in Each Categorical Feature")
ax.set_xlabel("Unique Values")
ax.set_ylabel("Feature")

fig6.tight_layout()

save_figure(
    fig6,
    "Figure_4_2.png"
)

# ==========================================================
# 4.4.1 FEATURE ENGINEERING
# Tạo các đặc trưng mới trước khi chia train/test
# ==========================================================

print("\n")
print("=" * 60)
print("4.4.1 FEATURE ENGINEERING")
print("=" * 60)

# Tổng số đêm lưu trú
df["total_nights"] = (
    df["stays_in_weekend_nights"]
    + df["stays_in_week_nights"]
)

# Tổng số khách
df["total_guests"] = (
    df["adults"]
    + df["children"]
    + df["babies"]
)

# Có trẻ em hoặc em bé đi cùng
df["has_children"] = (
    (df["children"] + df["babies"]) > 0
).astype(int)

# Tổng số lần đặt phòng trước đây
df["previous_bookings"] = (
    df["previous_cancellations"]
    + df["previous_bookings_not_canceled"]
)

# Khách từng hủy phòng
df["has_previous_cancellation"] = (
    df["previous_cancellations"] > 0
).astype(int)

# Giá trung bình trên mỗi khách
df["adr_per_guest"] = np.where(
    df["total_guests"] > 0,
    df["adr"] / df["total_guests"],
    0
)

# Giá trị đặt phòng ước tính
df["estimated_booking_value"] = (
    df["adr"] * df["total_nights"]
)

# Có lưu trú cuối tuần
df["has_weekend_stay"] = (
    df["stays_in_weekend_nights"] > 0
).astype(int)

created_features = [
    "total_nights",
    "total_guests",
    "has_children",
    "previous_bookings",
    "has_previous_cancellation",
    "adr_per_guest",
    "estimated_booking_value",
    "has_weekend_stay"
]

print("\nCreated Features:")
for feature in created_features:
    print("-", feature)

print("\nDataset Shape After Feature Engineering:", df.shape)


# ==========================================================
# Train - Test Split
# ==========================================================

from sklearn.model_selection import train_test_split

print("\n")
print("=" * 60)
print("TRAIN - TEST SPLIT")
print("=" * 60)

# Biến mục tiêu
TARGET = "is_canceled"

# ==========================================================
# Remove Data Leakage Columns
# ==========================================================

leakage_columns = [
    "reservation_status",
    "reservation_status_date",
    "assigned_room_type"
]

TARGET = "is_canceled"

X = df.drop(
    columns=[TARGET] + leakage_columns,
    errors="ignore"
)

y = df[TARGET]

print("\nFeature Matrix Shape :", X.shape)
print("Target Shape         :", y.shape)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\nTraining Set")

print("X_train :", X_train.shape)
print("y_train :", y_train.shape)

print("\nTesting Set")

print("X_test :", X_test.shape)
print("y_test :", y_test.shape)



print("\nTrain Class Distribution")

print(
    y_train.value_counts(normalize=True)
)

print("\nTest Class Distribution")

print(
    y_test.value_counts(normalize=True)
)


# ==========================================================
# Numeric & Categorical Features
# ==========================================================

numeric_features = X_train.select_dtypes(
    include=np.number
).columns.tolist()

categorical_features = X_train.select_dtypes(
    include=["object", "string"]
).columns.tolist()

print("\nNumeric Features")
print(numeric_features)

print("\nCategorical Features")
print(categorical_features)

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        ),
        (
            "scaler",
            StandardScaler()
        )
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="constant",
                fill_value="Unknown"
            )
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore"
            )
        )
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_pipeline,
            numeric_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)


print("\n")
print("=" * 60)
print("PIPELINE PREPROCESSING")
print("=" * 60)

X_train_processed = preprocessor.fit_transform(
    X_train
)

X_test_processed = preprocessor.transform(
    X_test
)

print("\nProcessed Dataset")

print("Train :", X_train_processed.shape)
print("Test  :", X_test_processed.shape)


# ==========================================================
# 4.4.2 FEATURE SELECTION - MUTUAL INFORMATION
# Mutual Information
# ==========================================================

from sklearn.feature_selection import mutual_info_classif

print("\n")
print("=" * 60)
print("4.4.2 FEATURE SELECTION - MUTUAL INFORMATION")
print("=" * 60)

feature_names = preprocessor.get_feature_names_out()

sample_size = min(
    30000,
    X_train_processed.shape[0]
)

rng = np.random.RandomState(42)

sample_indices = rng.choice(
    X_train_processed.shape[0],
    size=sample_size,
    replace=False
)

# Lấy mẫu từ tập train đã xử lý
X_mi_sample = X_train_processed[sample_indices]
y_mi_sample = y_train.iloc[sample_indices].to_numpy()

# Chỉ chuyển mẫu dùng tính MI sang dense
# Không chuyển toàn bộ X_train_processed để tránh tốn RAM
if hasattr(X_mi_sample, "toarray"):
    print("Converting MI sample from sparse matrix to dense array...")
    X_mi_sample = X_mi_sample.toarray()

print("MI sample type :", type(X_mi_sample))
print("MI sample shape:", X_mi_sample.shape)
# Các cột numeric nằm trước do thứ tự trong ColumnTransformer
# Numeric: đặc trưng liên tục -> False
# One-Hot: đặc trưng rời rạc -> True
n_numeric = len(numeric_features)
n_total_features = X_mi_sample.shape[1]

discrete_mask = np.array(
    [False] * n_numeric
    + [True] * (n_total_features - n_numeric),
    dtype=bool
)

print("Numeric feature count    :", n_numeric)
print("Categorical encoded count:", n_total_features - n_numeric)
print("Total feature count      :", n_total_features)

mi_scores = mutual_info_classif(
    X_mi_sample,
    y_mi_sample,
    discrete_features=discrete_mask,
    random_state=42
)

mi_result = pd.Series(
    mi_scores,
    index=feature_names,
    name="Mutual_Information"
).sort_values(ascending=False)

print("\nTop 20 Features by Mutual Information")
print(mi_result.head(20))

mi_plot = mi_result.head(15).copy()

mi_plot.index = (
    mi_plot.index
    .str.replace("numeric__", "", regex=False)
    .str.replace("categorical__", "", regex=False)
)

mi_plot = mi_plot.sort_values()

fig7, ax = plt.subplots(figsize=(12, 7))

bars = ax.barh(
    mi_plot.index,
    mi_plot.values,
    color="#2E86AB"
)

for bar in bars:
    value = bar.get_width()

    ax.text(
        value,
        bar.get_y() + bar.get_height() / 2,
        f" {value:.3f}",
        va="center",
        fontsize=8
    )

ax.set_title("Top 15 Features by Mutual Information")
ax.set_xlabel("Mutual Information Score")
ax.set_ylabel("Feature")

fig7.tight_layout()

save_figure(
    fig7,
    "Figure_4_3.png"
)

print("\nHoàn thành tính Mutual Information!")


# ==========================================================
# 4.5 DATA LEAKAGE PREVENTION
# ==========================================================

print("\n")
print("=" * 60)
print("4.5 DATA LEAKAGE PREVENTION")
print("=" * 60)

# ----------------------------------------------------------
# 1. Kiểm tra các cột rò rỉ đã được loại khỏi X
# ----------------------------------------------------------

remaining_leakage = [
    col for col in leakage_columns
    if col in X.columns
]

if len(remaining_leakage) == 0:
    print("\n✓ All leakage columns were removed from feature matrix.")
else:
    print("\n⚠ Leakage columns still remain:")
    print(remaining_leakage)


# ----------------------------------------------------------
# 2. Kiểm tra target không nằm trong tập đặc trưng
# ----------------------------------------------------------

if TARGET not in X.columns:
    print("✓ Target column is not included in feature matrix.")
else:
    print("⚠ Target column is still included in feature matrix.")


# ----------------------------------------------------------
# 3. Kiểm tra cùng số đặc trưng sau preprocessing
# ----------------------------------------------------------

if X_train_processed.shape[1] == X_test_processed.shape[1]:
    print(
        "✓ Train and test have the same number of processed features:",
        X_train_processed.shape[1]
    )
else:
    print("⚠ Train and test feature dimensions are different.")


# ----------------------------------------------------------
# 4. Kiểm tra tỷ lệ train-test
# ----------------------------------------------------------

total_samples = len(X_train) + len(X_test)

train_ratio = len(X_train) / total_samples
test_ratio = len(X_test) / total_samples

print(f"✓ Train ratio: {train_ratio:.2%}")
print(f"✓ Test ratio : {test_ratio:.2%}")


# ----------------------------------------------------------
# 5. Mô tả quy trình chống data leakage
# ----------------------------------------------------------

print("\nLeakage-safe preprocessing workflow:")

print("""
Raw Data
   ↓
Missing Value Handling
   ↓
Feature Engineering
   ↓
Remove Leakage Columns
   ↓
Train/Test Split
   ↓
Fit Imputer, Encoder and Scaler on TRAIN only
   ↓
Transform TRAIN and TEST
   ↓
Feature Selection on TRAIN only
""")

print("Hoàn thành kiểm tra Data Leakage!")


# ==========================================================
# CHAPTER 5 - MODEL TRAINING
# ==========================================================
print("\n" + "=" * 80)
print("CHAPTER 5 - MODEL TRAINING")
print("=" * 80)

import pandas as pd
import matplotlib.pyplot as plt

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (

    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report
)
wandb.login(force=True)
wandb.init(
    project="hotel-booking-demand",
    name="baseline-models-experiment",
    config={
        "test_size": 0.20,
        "random_state": 42,
        "lr_max_iter": 1000,
        "rf_n_estimators": 100,
        "rf_max_depth": 10
    }
)

print("\n" + "=" * 80)
print("CHAPTER 5 - MODEL TRAINING (W&B Tracking Enabled)")
print("=" * 80)

# ==========================================================
# 5.1 Logistic Regression
# ==========================================================

print("\nTraining Logistic Regression...")

lr = LogisticRegression(
    max_iter=1000,
    class_weight="balanced",
    random_state=42
)

lr.fit(X_train_processed, y_train)

# ==========================================================
# 5.2 Random Forest - Manual Hyperparameters
# ==========================================================

print("\nTraining Random Forest...")

rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

rf.fit(X_train_processed, y_train)

print("Random Forest Training Completed!")

# ==========================================================
# 5.3 Gradient Boosting
# ==========================================================

print("\nTraining Gradient Boosting...")

gb = GradientBoostingClassifier(
    random_state=42
)

gb.fit(
    X_train_processed,
    y_train
)

# ==========================================================
# Evaluation Function
# ==========================================================

def evaluate_model(model,name):

    prediction = model.predict(X_test_processed)

    probability = model.predict_proba(
        X_test_processed
    )[:,1]

    result = {

        "Model":name,

        "Accuracy":
        accuracy_score(
            y_test,
            prediction
        ),

        "Precision":
        precision_score(
            y_test,
            prediction
        ),

        "Recall":
        recall_score(
            y_test,
            prediction
        ),

        "F1-score":
        f1_score(
            y_test,
            prediction
        ),

        "ROC-AUC":
        roc_auc_score(
            y_test,
            probability
        )

    }

    print("\n")
    print("="*60)
    print(name)
    print("="*60)

    print(
        classification_report(
            y_test,
            prediction
        )
    )

    return result,prediction,probability

results=[]

lr_result,lr_pred,lr_prob = evaluate_model(
    lr,
    "Logistic Regression"
)

rf_result,rf_pred,rf_prob = evaluate_model(
    rf,
    "Random Forest"
)

gb_result,gb_pred,gb_prob = evaluate_model(
    gb,
    "Gradient Boosting"
)

results.append(lr_result)
results.append(rf_result)
results.append(gb_result)

result_df = pd.DataFrame(results)

print("\n")
print("="*80)
print("MODEL COMPARISON")
print("="*80)

print(result_df)

wandb.log({"Model_Comparison_Table": wandb.Table(dataframe=result_df)})

result_df.to_csv(
    "Table_5_1_Model_Result.csv",
    index=False
)

print("\nSaved: Table_5_1_Model_Result.csv")

# ==========================================================
# CHAPTER 6 - MODEL EVALUATION
# ==========================================================

print("\n" + "=" * 80)
print("CHAPTER 6 - MODEL EVALUATION")
print("=" * 80)

from sklearn.metrics import (
    confusion_matrix,
    ConfusionMatrixDisplay,
    RocCurveDisplay
)

# ==========================================================
# Select Best Model
# ==========================================================

models = {
    "Logistic Regression": (lr, lr_pred, lr_prob),
    "Random Forest": (rf, rf_pred, rf_prob),
    "Gradient Boosting": (gb, gb_pred, gb_prob)
}

best_index = result_df["F1-score"].idxmax()

best_name = result_df.loc[best_index, "Model"]

best_model, best_pred, best_prob = models[best_name]

print(f"\nBest Model: {best_name}")

# ==========================================================
# Confusion Matrix
# ==========================================================

plt.figure(figsize=(6,6))


ConfusionMatrixDisplay.from_predictions(
    y_test,
    best_pred,
    cmap="Blues",
    ax=plt.gca()
)

plt.title(f"Confusion Matrix - {best_name}")

plt.savefig(
    "Figure_6_1_ConfusionMatrix.png",
    dpi=300,
    bbox_inches="tight"
)
wandb.log({"Confusion_Matrix": wandb.Image(plt.gcf())})
plt.show()

# ==========================================================
# ROC Curve
# ==========================================================

plt.figure(figsize=(6,6))

RocCurveDisplay.from_predictions(
    y_test,
    best_prob,
    name=best_name,
    ax=plt.gca()
)

plt.plot([0,1],[0,1],'k--')

plt.title("ROC Curve")

plt.savefig(
    "Figure_6_2_ROC.png",
    dpi=300,
    bbox_inches="tight"
)
wandb.log({"ROC_Curve": wandb.Image(plt.gcf())})
plt.show()

# ==========================================================
# Feature Importance
# ==========================================================

print("\nGenerating Feature Importance...")

if hasattr(best_model, "feature_importances_"):

    # Trích xuất chính xác tên cột từ bộ preprocessor
    raw_names = preprocessor.get_feature_names_out()
    # Làm sạch tiền tố 'numeric__' và 'categorical__' để hiển thị đẹp hơn
    clean_names = [name.split('__')[-1] for name in raw_names]

    importance = best_model.feature_importances_

    importance_df = pd.DataFrame({
        "Feature": clean_names,
        "Importance": importance
    })

    importance_df = importance_df.sort_values(
        by="Importance",
        ascending=False
    )

    print("\nTop 10 Important Features")
    print(importance_df.head(10).to_string(index=False))

    plt.figure(figsize=(10, 6))
    import seaborn as sns
    sns.barplot(
        x=importance_df.head(10)["Importance"],
        y=importance_df.head(10)["Feature"],
        palette="viridis"
    )

    plt.title(f"Top 10 Important Features - {best_name}", fontsize=13, fontweight='bold')
    plt.xlabel("Importance Score")
    plt.ylabel("Features")
    plt.tight_layout()

    plt.savefig(
        "Figure_6_3_FeatureImportance.png",
        dpi=300
    )
    wandb.log({"Feature_Importance": wandb.Image(plt.gcf())})
    plt.show()

else:

    print("Model does not support feature importance.")

# ==========================================================
# Save Classification Report
# ==========================================================

report = classification_report(
    y_test,
    best_pred,
    output_dict=True
)

report_df = pd.DataFrame(report).transpose()

report_df.to_csv(
    "Classification_Report.csv"
)

print("\nSaved: Classification_Report.csv")

# ==========================================================
# Error Analysis
# ==========================================================

error_df = pd.DataFrame()

error_df["Actual"] = y_test.reset_index(drop=True)

error_df["Prediction"] = best_pred

error_df["Correct"] = (
    error_df["Actual"] ==
    error_df["Prediction"]
)

errors = error_df[
    error_df["Correct"] == False
]

print("\nTotal Wrong Predictions :", len(errors))

print(errors.head(10))

errors.to_csv(
    "Prediction_Error.csv",
    index=False
)

print("Saved: Prediction_Error.csv")

# ==========================================================
# Final Result
# ==========================================================

print("\n" + "="*80)
print("EXPERIMENT COMPLETED")
print("="*80)

print(result_df)

print("\nGenerated Files")

print("1. Table_5_1_Model_Result.csv")
print("2. Classification_Report.csv")
print("3. Prediction_Error.csv")
print("4. Figure_6_1_ConfusionMatrix.png")
print("5. Figure_6_2_ROC.png")
print("6. Figure_6_3_FeatureImportance.png")
# ==========================================================
# EXTRA - MODEL COMPARISON
# ==========================================================

print("\n" + "="*80)
print("MODEL COMPARISON")
print("="*80)

import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve

# ----------------------------------------------------------
# ROC Curve Comparison
# ----------------------------------------------------------

plt.figure(figsize=(8,6))

models = [
    ("Logistic Regression", lr, lr_prob),
    ("Random Forest", rf, rf_prob),
    ("Gradient Boosting", gb, gb_prob)
]

for name, model, prob in models:

    fpr, tpr, _ = roc_curve(y_test, prob)

    auc = roc_auc_score(y_test, prob)

    plt.plot(
        fpr,
        tpr,
        linewidth=2,
        label=f"{name} (AUC = {auc:.3f})"
    )

plt.plot([0,1],[0,1],'k--')

plt.xlabel("False Positive Rate")

plt.ylabel("True Positive Rate")

plt.title("ROC Curve Comparison")

plt.legend()

plt.grid(True)

plt.tight_layout()

plt.savefig(
    "Figure_6_4_ROC_Comparison.png",
    dpi=300
)

plt.show()

print("Saved : Figure_6_4_ROC_Comparison.png")

# ----------------------------------------------------------
# Beautiful Result Table
# ----------------------------------------------------------

result_df = result_df.copy()

for col in [
    "Accuracy",
    "Precision",
    "Recall",
    "F1-score",
    "ROC-AUC"
]:
    result_df[col] = result_df[col].round(4)

result_df = result_df.sort_values(
    by="F1-score",
    ascending=False
).reset_index(drop=True)

print("\n")
print(result_df)


result_df.to_csv("Table_5_2_Model_Comparison.csv", index=False)

print("Saved : Table_5_2_Model_Comparison.csv")

# ----------------------------------------------------------
# Best Model
# ----------------------------------------------------------

best_model_name = result_df.iloc[0]["Model"]

best_f1 = result_df.iloc[0]["F1-score"]

best_auc = result_df.iloc[0]["ROC-AUC"]

print("\n")
print("="*60)
print("BEST MODEL")
print("="*60)

print(f"Model : {best_model_name}")
print(f"F1-score : {best_f1}")
print(f"ROC-AUC : {best_auc}")

# ----------------------------------------------------------
# Summary
# ----------------------------------------------------------

summary = pd.DataFrame({

    "Metric":[
        "Accuracy",
        "Precision",
        "Recall",
        "F1-score",
        "ROC-AUC"
    ],

    "Value":[
        result_df.iloc[0]["Accuracy"],
        result_df.iloc[0]["Precision"],
        result_df.iloc[0]["Recall"],
        result_df.iloc[0]["F1-score"],
        result_df.iloc[0]["ROC-AUC"]
    ]

})

summary.to_csv(
    "Best_Model_Result.csv",
    index=False
)

print("Saved : Best_Model_Result.csv")

print("\n")
print("="*80)
print("ALL TASKS COMPLETED")
print("="*80)

joblib.dump(best_model, "best_hotel_model.pkl")
joblib.dump(preprocessor, "preprocessor.pkl")
wandb.finish()
