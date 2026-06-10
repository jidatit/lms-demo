import React from "react";
import courseicon from "../../../src/assets/course.png";
import { Chip, Typography } from "@mui/material"; // Assuming you're using MUI
import { Link } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";

export const BundleCard = ({ data, discounts }) => {
  const discount = discounts.find(
    (d) => d.resource_Id === data.bundleId && d.enable === "true"
  );

  const getOriginalPrice = () => parseFloat(data.seatprice) || 0;
  const originalPrice = getOriginalPrice();
  const discountedPrice = discount
    ? originalPrice * (1 - (parseFloat(discount.percentage) || 0) / 100)
    : originalPrice;

  const formatPrice = (price) => {
    return typeof price === "number" ? price.toFixed(2) : "0.00";
  };
  const truncateDescription = (description, maxLength) => {
    return description.length > maxLength
      ? description.slice(0, maxLength) + "..."
      : description;
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow flex flex-col h-full">
      <img
        className="rounded-t-lg  no-round cursor-not-allowed w-full h-[200px] object-cover"
        src={courseicon}
        alt="Bundle Icon"
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Typography variant="h5" component="h2" gutterBottom>
            {data.name}
          </Typography>
          <Typography
            style={{
              maxHeight: "4.5em", // Allows for 3 lines of text
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
            variant="body2"
            color="textSecondary"
          >
            {truncateDescription(data.description, 100)}
          </Typography>

          {discount && (
            <Chip
              label={`${discount.percentage}% OFF`}
              color="error"
              size="medium"
              sx={{ mb: 1, mt: 1 }}
            />
          )}
        </div>

        {/* Add to Cart Button */}
        {/* <div className="w-full flex flex-col justify-center items-center">
					<Typography variant="body1">
						{discount ? (
							<>
								<span
									style={{
										textDecoration: "line-through",
										color: "gray",
										marginRight: "10px",
									}}
								>
									${formatPrice(originalPrice)}
								</span>
								<span style={{ color: "green" }}>
									${formatPrice(discountedPrice)}
								</span>
							</>
						) : (
							<span>${formatPrice(originalPrice)}</span>
						)}{" "}
						/ seat
					</Typography>
					<Link
						to={`/contrib_dashboard/mybundlecart?bundleId=${data.bundleId}`}
					>
						<div className="cursor-pointer inline-flex items-center px-5 py-2 text-md font-bold text-center text-white bg-[#02496F] rounded-[22px] hover:bg-blue-800">
							Add to Cart
						</div>
					</Link>
				</div> */}
        <div className="w-full flex justify-between items-end">
          <div className=" flex items-end">
            {discount ? (
              <>
                <div className="flex flex-col">
                  <span
                    className=" text-md"
                    style={{
                      textDecoration: "line-through",
                      color: "gray",
                      marginRight: "10px",
                    }}
                  >
                    ${formatPrice(originalPrice)}
                  </span>
                  <span className=" text-3xl " style={{ color: "green" }}>
                    ${formatPrice(discountedPrice)}
                  </span>
                </div>
              </>
            ) : (
              <p className=" text-3xl text-[#02496F]">
                ${formatPrice(originalPrice)}
              </p>
            )}{" "}
            <span className={`ml-1 text-sm ${discount ? "pb-0" : "pb-1"}`}>
              / seat
            </span>
          </div>
          <div>
            <Link
              className=" cursor-pointer"
              to={`/contrib_dashboard/mybundlecart?bundleId=${data.bundleId}`}
            >
              <FaCartPlus className=" text-3xl no text-[#02496F] cursor-pointer animate-bounce hover:animate-none " />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
