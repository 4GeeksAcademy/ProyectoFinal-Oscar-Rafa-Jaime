import React, { Component } from "react";
import "../../styles/footer.css";
import { useTranslation } from "react-i18next";

export const Footer = () => {
	const { t } = useTranslation();

	return (
		<footer className="footer">
			<p className="text">{t("footerText")}</p>
		</footer>
	)
};
